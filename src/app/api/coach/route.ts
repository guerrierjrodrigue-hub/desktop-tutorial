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
    return NextResponse.json({
      reply: offlineCoachReply(coach.id, lastUser.content),
      source: "offline",
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: coach.systemPrompt,
      messages: toClaudeMessages(messages),
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const reply = textBlock?.text.trim() || offlineCoachReply(coach.id, lastUser.content);

    return NextResponse.json({ reply, source: "anthropic" });
  } catch {
    // Never leave the user without an answer.
    return NextResponse.json({
      reply: offlineCoachReply(coach.id, lastUser.content),
      source: "fallback",
    });
  }
}
