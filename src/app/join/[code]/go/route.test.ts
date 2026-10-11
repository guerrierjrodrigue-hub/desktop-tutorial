import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the server-only deps so importing the route is safe in node and so we
// can assert the mutation (joinChallenge) is never triggered by a GET.
const joinChallenge = vi.fn(async (...args: unknown[]) => {
  void args;
  return { ok: true };
});
const getAuthedContext = vi.fn(async () => ({ userId: "u1", supabase: {} }));
const getChallengeByInviteCode = vi.fn(async () => ({ id: "c1" }));

vi.mock("@/app/(app)/challenges/actions", () => ({
  joinChallenge: (...a: unknown[]) => joinChallenge(...a),
}));
vi.mock("@/lib/supabase/auth", () => ({ getAuthedContext: () => getAuthedContext() }));
vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => true }));
vi.mock("@/lib/queries/challenges", () => ({
  getChallengeByInviteCode: () => getChallengeByInviteCode(),
}));

const { GET, POST } = await import("./route");

const params = (code: string) => ({ params: Promise.resolve({ code }) });

beforeEach(() => {
  joinChallenge.mockClear();
  getChallengeByInviteCode.mockClear();
});

describe("GET /join/[code]/go", () => {
  it("does NOT mutate — it redirects to the confirmation page", async () => {
    const req = new NextRequest("https://app.test/join/ABC/go?ref=r1");
    const res = await GET(req, params("ABC"));
    expect(res.status).toBe(307); // NextResponse.redirect default
    expect(res.headers.get("location")).toBe("https://app.test/join/ABC?ref=r1");
    expect(joinChallenge).not.toHaveBeenCalled();
    expect(getChallengeByInviteCode).not.toHaveBeenCalled();
  });

  it("preserves no query when there is no ref", async () => {
    const req = new NextRequest("https://app.test/join/ABC/go");
    const res = await GET(req, params("ABC"));
    expect(res.headers.get("location")).toBe("https://app.test/join/ABC");
    expect(joinChallenge).not.toHaveBeenCalled();
  });
});

describe("POST /join/[code]/go", () => {
  it("performs the join and redirects to /challenges", async () => {
    const req = new NextRequest("https://app.test/join/ABC/go", { method: "POST" });
    const res = await POST(req, params("ABC"));
    expect(joinChallenge).toHaveBeenCalledTimes(1);
    expect(res.headers.get("location")).toBe("https://app.test/challenges");
  });

  it("drops an invalid ref (credits no referrer)", async () => {
    const req = new NextRequest("https://app.test/join/ABC/go?ref=not-a-uuid", { method: "POST" });
    await POST(req, params("ABC"));
    expect(joinChallenge).toHaveBeenCalledWith("c1", null);
  });
});
