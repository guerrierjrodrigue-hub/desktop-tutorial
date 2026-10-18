import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/nextjs";
import { COACH_MODEL } from "@/lib/coaches";
import { getAuthedContext } from "@/lib/supabase/auth";

/**
 * Admin-only health probe for the coach model. Makes a tiny real call to the
 * Anthropic API and reports success/latency, or the exact failure (status,
 * type, message) so a broken key/model is diagnosable without reading logs.
 * Never echoes any chat content.
 */
export async function GET() {
  const ctx = await getAuthedContext();
  if (!ctx) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const { data } = await ctx.supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", ctx.userId)
    .single();
  if (!(data as { is_admin?: boolean } | null)?.is_admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, model: COACH_MODEL, error: "no_api_key" },
      { status: 503 },
    );
  }

  const started = Date.now();
  try {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model: COACH_MODEL,
      max_tokens: 8,
      messages: [{ role: "user", content: "ping" }],
    });
    return NextResponse.json({
      ok: true,
      model: COACH_MODEL,
      latencyMs: Date.now() - started,
      stopReason: res.stop_reason,
    });
  } catch (err) {
    const e = err as { status?: number; name?: string; message?: string; error?: { type?: string } };
    Sentry.captureException(err, { tags: { feature: "coach-health" } });
    return NextResponse.json(
      {
        ok: false,
        model: COACH_MODEL,
        status: e?.status ?? null,
        type: e?.error?.type ?? e?.name ?? null,
        message: e?.message ?? null,
        latencyMs: Date.now() - started,
      },
      { status: 502 },
    );
  }
}
