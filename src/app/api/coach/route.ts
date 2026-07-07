import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "@/types";
import { offlineCoachReply, toClaudeMessages } from "@/lib/coaches";
import { getCoach } from "@/data/coaches";

interface CoachRequest {
  coachId?: string;
  messages: ChatMessage[];
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

  // No key configured → deterministic, in-voice fallback so the demo works.
  if (!apiKey) {
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
