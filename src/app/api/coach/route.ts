import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/nextjs";
import type { ChatMessage } from "@/types";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { COACH_MODEL, offlineCoachReply, toClaudeMessages } from "@/lib/coaches";
import { getCoach, type Coach } from "@/data/coaches";
import { getAuthedContext, type AuthedContext } from "@/lib/supabase/auth";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { isCoachEnabled } from "@/lib/flags";
import { getUserTimezone } from "@/lib/timezone";
import { startOfLocalDayUTC } from "@/lib/date";
import { buildCoachContext } from "@/lib/coach-context";
import { detectCrisis, crisisReply, CRISIS_PROTOCOL } from "@/lib/coach-safety";

interface CoachRequest {
  coachId?: string;
  messages: ChatMessage[];
}

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
/** Max messages sent to the model per request. */
const MAX_MESSAGES = 20;
/** Max characters per message. */
const MAX_CHARS = 2000;
/** Durable per-user daily message cap (free beta). Overridable via env. */
const DAILY_LIMIT = Number(process.env.COACH_DAILY_LIMIT ?? 50);

/** In-memory short-window throttle (burst protection); the durable cap is in Supabase. */
const requestLog = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(userId) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestLog.set(userId, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

/** Honest, localized "AI is down" message. Never fake a coach reply. */
function unavailableMessage(dict: Dictionary, coach: Coach): string {
  return dict["coach.unavailable"].replace("{coach}", coach.name);
}

/**
 * Log the exact Anthropic failure (status, type, message) to the server logs and
 * Sentry — never the chat content. The SDK error's own message describes the API
 * error, not the user's input.
 */
function logAnthropicError(err: unknown, userId: string): void {
  const e = err as { status?: number; name?: string; message?: string; error?: { type?: string } };
  const status = e?.status;
  const type = e?.error?.type ?? e?.name;
  console.error(
    `[coach] anthropic error user=${userId} model=${COACH_MODEL} status=${status ?? "?"} type=${type ?? "?"} message=${e?.message ?? "?"}`,
  );
  Sentry.captureException(err, {
    tags: {
      feature: "coach",
      anthropic_status: String(status ?? ""),
      anthropic_type: String(type ?? ""),
    },
  });
}

function textResponse(text: string, source: string): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Coach-Source": source,
      "Cache-Control": "no-store",
    },
  });
}

/** Persist one message to the durable history (best-effort, owner RLS). */
async function persist(
  ctx: AuthedContext,
  coachId: string,
  role: "user" | "assistant",
  content: string,
  tokens: number | null,
): Promise<void> {
  try {
    await ctx.supabase
      .from("coach_messages")
      .insert({ user_id: ctx.userId, coach_id: coachId, role, content, tokens });
  } catch {
    // Non-fatal: a failed history write must never break the reply.
  }
}

export async function POST(req: Request) {
  // Coach disabled: 404 before touching Anthropic or reading ANTHROPIC_API_KEY.
  if (!isCoachEnabled()) {
    return new NextResponse(null, { status: 404 });
  }

  let body: CoachRequest;
  try {
    body = (await req.json()) as CoachRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const coach = getCoach(body.coachId ?? "barnabas");
  const coachId = coach.id;
  const messages = body.messages ?? [];
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  // Length limits — reject oversized input with a clear, localized message.
  if (messages.some((m) => (m.content ?? "").length > MAX_CHARS)) {
    return NextResponse.json({ error: "too_long", reply: dict["coach.tooLong"] }, { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return NextResponse.json({ error: "No user message" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const ctx = await getAuthedContext();

  // Durable daily cap (free beta) — counts today's user messages in Supabase.
  if (ctx) {
    const tz = await getUserTimezone();
    const since = startOfLocalDayUTC(tz);
    const { count } = await ctx.supabase
      .from("coach_messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ctx.userId)
      .eq("role", "user")
      .gte("created_at", since);
    if ((count ?? 0) >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: "daily_limit", reply: dict["coach.limitReached"].replace("{n}", String(DAILY_LIMIT)) },
        { status: 429 },
      );
    }
  }

  // Record the user's message in durable history.
  if (ctx) await persist(ctx, coachId, "user", lastUser.content, null);

  // SAFETY: a crisis message short-circuits everything — scripted, deterministic.
  const crisis = detectCrisis(lastUser.content);
  if (crisis) {
    const reply = crisisReply(crisis, locale);
    if (ctx) await persist(ctx, coachId, "assistant", reply, null);
    return textResponse(reply, "safety");
  }

  // Demo / unauthenticated: keep the deterministic in-voice reply so the app
  // stays explorable without a backend.
  if (!ctx) {
    return textResponse(offlineCoachReply(coachId, lastUser.content, locale), "offline");
  }

  // Authenticated but the AI can't run (misconfigured key, or burst-limited):
  // be honest, keep the user's message, and never fake a coach reply.
  if (!apiKey || isRateLimited(ctx.userId)) {
    if (!apiKey) {
      console.error("[coach] ANTHROPIC_API_KEY is not configured");
      Sentry.captureMessage("coach: ANTHROPIC_API_KEY not configured", "error");
    }
    return textResponse(unavailableMessage(dict, coach), "unavailable");
  }

  // Trusted, server-built context + safety protocol appended to the persona.
  const tz = await getUserTimezone();
  let context = "";
  try {
    context = await buildCoachContext(ctx.supabase, ctx.userId, locale, tz);
  } catch {
    context = "";
  }
  const system = [
    coach.systemPrompt,
    locale === "fr" ? "Respond in French (the user's language)." : "",
    CRISIS_PROTOCOL,
    context,
  ]
    .filter(Boolean)
    .join("\n\n");

  const trimmed = messages.slice(-MAX_MESSAGES);

  try {
    const client = new Anthropic({ apiKey });
    const anthropicStream = await client.messages.create({
      model: COACH_MODEL,
      max_tokens: 1024,
      system,
      messages: toClaudeMessages(trimmed),
      stream: true,
    });

    const encoder = new TextEncoder();
    let streamedAny = false;
    let full = "";
    let inputTokens = 0;
    let outputTokens = 0;

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of anthropicStream) {
            if (event.type === "message_start") {
              inputTokens = event.message.usage?.input_tokens ?? 0;
            } else if (event.type === "message_delta") {
              outputTokens = event.usage?.output_tokens ?? outputTokens;
            } else if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta" &&
              event.delta.text
            ) {
              streamedAny = true;
              full += event.delta.text;
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          if (!streamedAny) {
            Sentry.captureMessage("coach: model returned an empty stream", "warning");
            controller.enqueue(encoder.encode(unavailableMessage(dict, coach)));
          }
        } catch (err) {
          logAnthropicError(err, ctx.userId);
          if (!streamedAny) {
            controller.enqueue(encoder.encode(unavailableMessage(dict, coach)));
          }
        } finally {
          controller.close();
          // Only persist a genuine model reply — never the honest "unavailable"
          // placeholder, so history stays truthful and the user message stands.
          if (streamedAny) {
            const tokens = inputTokens + outputTokens;
            console.log(
              `[coach] user=${ctx.userId} model=${COACH_MODEL} in=${inputTokens} out=${outputTokens} total=${tokens}`,
            );
            await persist(ctx, coachId, "assistant", full, tokens || null);
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Coach-Source": "anthropic",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    // The model call failed before streaming — log the exact error and return an
    // honest message. The user's message was already saved; don't fake a reply.
    logAnthropicError(err, ctx.userId);
    return textResponse(unavailableMessage(dict, coach), "unavailable");
  }
}
