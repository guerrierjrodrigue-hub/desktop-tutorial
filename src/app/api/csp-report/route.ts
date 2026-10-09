import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * CSP violation sink. Browsers POST here (via the CSP `report-to` /
 * `report-uri` directives) when a resource is blocked or would be blocked in
 * Report-Only mode. We log a compact summary so the allowlist can be tuned,
 * and forward to Sentry when it's configured. Always answers 204 so the
 * browser doesn't retry.
 *
 * Accepts both report shapes:
 *  - `application/csp-report`     → { "csp-report": { ... } }
 *  - `application/reports+json`   → [ { type: "csp-violation", body: { ... } } ]
 */
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
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
