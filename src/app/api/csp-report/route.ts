import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

// Reports are tiny; anything larger is junk or abuse. Cap the body hard.
const MAX_BYTES = 10 * 1024; // 10 KB
// Best-effort in-memory rate limit (per instance): a flood of reports from one
// source can't drown the logs / Sentry. Fixed window.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now >= entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    // Opportunistic cleanup so the map can't grow unbounded.
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now >= v.resetAt) hits.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

/**
 * CSP violation sink. Browsers POST here (via the CSP `report-to` /
 * `report-uri` directives) when a resource is blocked or would be blocked in
 * Report-Only mode. We log a compact summary so the allowlist can be tuned,
 * and forward to Sentry when it's configured. Always answers 204 so the
 * browser doesn't retry.
 *
 * Hardened: the body is capped at 10 KB and each client IP is rate-limited, so
 * the endpoint can't be used to flood logs/Sentry or ship large payloads.
 *
 * Accepts both report shapes:
 *  - `application/csp-report`     → { "csp-report": { ... } }
 *  - `application/reports+json`   → [ { type: "csp-violation", body: { ... } } ]
 */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) return new NextResponse(null, { status: 429 });

  // Reject oversized reports up front via the declared length.
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  try {
    const raw = await req.text();
    if (raw.length > MAX_BYTES) return new NextResponse(null, { status: 413 });
    if (raw) {
      let violations: unknown[] = [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          violations = parsed
            .filter((r) => r && (r.type === "csp-violation" || r.body))
            .map((r) => r.body ?? r);
        } else if (parsed["csp-report"]) {
          violations = [parsed["csp-report"]];
        } else {
          violations = [parsed];
        }
      } catch {
        violations = [raw.slice(0, 2000)];
      }

      for (const v of violations) {
        const d = (v ?? {}) as Record<string, unknown>;
        const directive = d["effective-directive"] ?? d["effectiveDirective"] ?? d["violated-directive"];
        const blocked = d["blocked-uri"] ?? d["blockedURL"] ?? d["blocked-url"];
        const docUri = d["document-uri"] ?? d["documentURL"];
        // Keep the log line short and structured for easy scanning.
        console.warn("[csp-report]", JSON.stringify({ directive, blocked, docUri }));
        Sentry.captureMessage("CSP violation", {
          level: "warning",
          extra: { directive, blocked, docUri },
        });
      }
    }
  } catch {
    // Never fail a report submission.
  }
  return new NextResponse(null, { status: 204 });
}
