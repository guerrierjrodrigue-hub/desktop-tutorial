import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn() }));

const { POST } = await import("./route");

function report(body: string, ip: string, extraHeaders: Record<string, string> = {}) {
  return new NextRequest("https://app.test/api/csp-report", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip, ...extraHeaders },
    body,
  });
}

describe("POST /api/csp-report", () => {
  it("accepts a normal report with 204", async () => {
    const body = JSON.stringify({ "csp-report": { "violated-directive": "img-src" } });
    const res = await POST(report(body, "1.1.1.1"));
    expect(res.status).toBe(204);
  });

  it("rejects an oversized body with 413 (declared length)", async () => {
    const res = await POST(
      report("{}", "2.2.2.2", { "content-length": String(11 * 1024) }),
    );
    expect(res.status).toBe(413);
  });

  it("rejects an oversized actual body with 413", async () => {
    const big = JSON.stringify({ "csp-report": { blob: "x".repeat(11 * 1024) } });
    const res = await POST(report(big, "3.3.3.3"));
    expect(res.status).toBe(413);
  });

  it("rate-limits a flood from one IP with 429", async () => {
    const ip = "4.4.4.4";
    const body = JSON.stringify({ "csp-report": { "violated-directive": "img-src" } });
    let last = 204;
    for (let i = 0; i < 25; i++) last = (await POST(report(body, ip))).status;
    expect(last).toBe(429);
  });
});
