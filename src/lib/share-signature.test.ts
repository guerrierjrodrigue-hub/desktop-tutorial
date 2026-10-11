import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  signShareParams,
  verifyShareParams,
  canonicalParams,
  shareSigningEnabled,
} from "./share-signature";

describe("canonicalParams", () => {
  it("is independent of key order", () => {
    expect(canonicalParams({ b: "2", a: "1" })).toBe(canonicalParams({ a: "1", b: "2" }));
    expect(canonicalParams({ a: "1", b: "2" })).toBe("a=1&b=2");
  });
});

describe("with a signing secret configured", () => {
  beforeEach(() => {
    process.env.SHARE_SIGNING_SECRET = "test-secret-key";
  });
  afterEach(() => {
    delete process.env.SHARE_SIGNING_SECRET;
  });

  it("reports signing as enabled", () => {
    expect(shareSigningEnabled()).toBe(true);
  });

  it("verifies a signature it produced", () => {
    const params = { type: "streak", value: "42", label: "On fire", text: "" };
    const sig = signShareParams(params);
    expect(sig).toBeTruthy();
    expect(verifyShareParams(params, sig)).toBe(true);
  });

  it("rejects a tampered value", () => {
    const params = { type: "streak", value: "42", label: "On fire", text: "" };
    const sig = signShareParams(params);
    expect(verifyShareParams({ ...params, value: "999" }, sig)).toBe(false);
  });

  it("rejects a missing or wrong signature", () => {
    const params = { ref: "John 3:16", text: "For God so loved the world" };
    expect(verifyShareParams(params, null)).toBe(false);
    expect(verifyShareParams(params, "deadbeef")).toBe(false);
  });
});

describe("with no signing secret (demo/local)", () => {
  beforeEach(() => {
    delete process.env.SHARE_SIGNING_SECRET;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.CRON_SECRET;
  });

  it("reports signing as disabled and signs to null", () => {
    expect(shareSigningEnabled()).toBe(false);
    expect(signShareParams({ a: "1" })).toBeNull();
  });

  it("allows any params (nothing to enforce)", () => {
    expect(verifyShareParams({ a: "1" }, null)).toBe(true);
  });
});
