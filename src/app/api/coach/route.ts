import { NextResponse } from "next/server";
import type { ChatMessage } from "@/types";
import { offlineBarnabasReply, toOpenAIMessages } from "@/lib/barnabas";

export const runtime = "edge";

interface CoachRequest {
  messages: ChatMessage[];
}

export async function POST(req: Request) {
  let body: CoachRequest;
  try {
    body = (await req.json()) as CoachRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = body.messages ?? [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return NextResponse.json({ error: "No user message" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // No key configured → deterministic, in-voice fallback so the demo works.
  if (!apiKey) {
    return NextResponse.json({
      reply: offlineBarnabasReply(lastUser.content),
      source: "offline",
    });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.8,
        max_tokens: 400,
        messages: toOpenAIMessages(messages),
      }),
    });

    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    const reply: string =
      data.choices?.[0]?.message?.content?.trim() ??
      offlineBarnabasReply(lastUser.content);

    return NextResponse.json({ reply, source: "openai" });
  } catch {
    // Never leave the user without an answer.
    return NextResponse.json({
      reply: offlineBarnabasReply(lastUser.content),
      source: "fallback",
    });
  }
}
