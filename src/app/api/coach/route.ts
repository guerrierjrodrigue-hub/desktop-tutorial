import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "@/types";
import { offlineCoachReply, toClaudeMessages } from "@/lib/coaches";
import { getCoach } from "@/data/coaches";
import { getAuthedContext } from "@/lib/supabase/auth";

interface CoachRequest {
  coachId?: string;
  messages: ChatMessage[];
}

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

/** In-memory per-user request log. Fluid Compute reuses instances, so this meaningfully throttles a single account even though it isn't shared across regions. */
const requestLog = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(userId) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  recent.push(now);
  requestLog.set(userId, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

/**
 * Stream a plain-text reply in a single chunk. Used for offline / fallback
 * answers so the client reads every response the same way (a text stream),
 * regardless of whether it came from Claude or the deterministic fallback.
 */
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

export async function POST(req: Request) {
  let body: CoachRequest;
  try {
    body = (await req.json()) as CoachRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const coach = getCoach(body.coachId ?? "barnabas");
  const messages = body.messages ?? [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return NextResponse.json({ error: "No user message" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const ctx = await getAuthedContext();

  // No key configured, no signed-in user, or over the rate limit → deterministic,
  // in-voice fallback. Never spend the paid API on an anonymous or abusive caller.
  if (!apiKey || !ctx || isRateLimited(ctx.userId)) {
    return textResponse(offlineCoachReply(coach.id, lastUser.content), "offline");
  }

  try {
    const client = new Anthropic({ apiKey });
    const anthropicStream = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: coach.systemPrompt,
      messages: toClaudeMessages(messages),
      stream: true,
    });

    const encoder = new TextEncoder();
    let streamedAny = false;

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of anthropicStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta" &&
              event.delta.text
            ) {
              streamedAny = true;
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          // If Claude returned nothing usable, fall back so the bubble is never empty.
          if (!streamedAny) {
            controller.enqueue(
              encoder.encode(offlineCoachReply(coach.id, lastUser.content)),
            );
          }
        } catch {
          if (!streamedAny) {
            controller.enqueue(
              encoder.encode(offlineCoachReply(coach.id, lastUser.content)),
            );
          }
        } finally {
          controller.close();
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
  } catch {
    // Never leave the user without an answer (e.g. the request failed before streaming).
    return textResponse(offlineCoachReply(coach.id, lastUser.content), "fallback");
  }
}
