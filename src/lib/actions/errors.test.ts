import { describe, it, expect, vi } from "vitest";
import { z } from "zod";

// Sentry must be mocked before importing the module under test.
const captureException = vi.fn();
vi.mock("@sentry/nextjs", () => ({ captureException: (e: unknown) => captureException(e) }));

const { fail, logAndFail, validate, ERR } = await import("./errors");

describe("fail", () => {
  it("returns a not-ok result carrying the code as the error", () => {
    expect(fail("some.code")).toEqual({ ok: false, error: "some.code" });
  });
});

describe("logAndFail", () => {
  it("captures the raw error to Sentry and returns a safe generic code", () => {
    captureException.mockClear();
    const raw = new Error("relation \"foo\" does not exist");
    const result = logAndFail(raw);
    expect(captureException).toHaveBeenCalledWith(raw);
    expect(result).toEqual({ ok: false, error: ERR.unexpected });
    // Never leaks the raw message.
    expect(JSON.stringify(result)).not.toContain("does not exist");
  });

  it("honors an explicit code", () => {
    expect(logAndFail(new Error("x"), "errors.validation").error).toBe("errors.validation");
  });
});

describe("validate", () => {
  const schema = z.object({
    title: z.string().min(1, "errors.titleRequired").max(5, "errors.tooLong"),
    n: z.number().int().min(0),
  });

  it("returns parsed data on success", () => {
    const r = validate(schema, { title: "hi", n: 3 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toEqual({ title: "hi", n: 3 });
  });

  it("surfaces a schema's dictionary-key message as the error code", () => {
    const r = validate(schema, { title: "", n: 1 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.result.error).toBe("errors.titleRequired");
  });

  it("falls back to the generic validation code for plain messages", () => {
    // `n` fails with zod's default (non-dotted) message → generic code.
    const r = validate(schema, { title: "ok", n: -1 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.result.error).toBe(ERR.validation);
  });

  it("rejects the wrong type without throwing", () => {
    const r = validate(schema, { title: 123, n: "nope" });
    expect(r.ok).toBe(false);
  });
});
