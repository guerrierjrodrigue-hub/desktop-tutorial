import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const state = vi.hoisted(() => ({
  configured: true,
  getUser: (async () => ({ data: { user: null } })) as () => Promise<unknown>,
}));

vi.mock("./config", () => ({
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "anon-key",
  isSupabaseConfigured: () => state.configured,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser: () => state.getUser() } }),
}));

import { updateSession } from "./middleware";

const req = (path: string) => new NextRequest(`https://app.test${path}`);
const isLoginRedirect = (res: Response) =>
  res.status === 307 &&
  new URL(res.headers.get("location")!).pathname === "/login";

describe("updateSession", () => {
  beforeEach(() => {
    state.configured = true;
    state.getUser = async () => ({ data: { user: null } });
  });

  it("fails open when Supabase is not configured (demo mode)", async () => {
    state.configured = false;
    const res = await updateSession(req("/dashboard"));
    expect(isLoginRedirect(res)).toBe(false);
  });

  // Regression guard: an auth outage must never expose protected pages.
  it("redirects protected routes to /login when getUser() throws", async () => {
    state.getUser = async () => {
      throw new Error("network down");
    };
    const res = await updateSession(req("/dashboard/today"));
    expect(isLoginRedirect(res)).toBe(true);
    expect(new URL(res.headers.get("location")!).searchParams.get("redirect"))
      .toBe("/dashboard/today");
  });

  it("lets public routes through when getUser() throws", async () => {
    state.getUser = async () => {
      throw new Error("network down");
    };
    const res = await updateSession(req("/pricing"));
    expect(isLoginRedirect(res)).toBe(false);
  });

  it("redirects anonymous users on protected routes", async () => {
    const res = await updateSession(req("/profile"));
    expect(isLoginRedirect(res)).toBe(true);
  });

  it("lets authenticated users through", async () => {
    state.getUser = async () => ({ data: { user: { id: "u1" } } });
    const res = await updateSession(req("/profile"));
    expect(isLoginRedirect(res)).toBe(false);
  });
});
