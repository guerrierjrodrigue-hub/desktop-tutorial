import * as Sentry from "@sentry/nextjs";
import type { z } from "zod";
import { type ActionResult } from "./result";

/**
 * Every action error is surfaced as a DICTIONARY KEY, never raw text. The
 * client renders `dict[result.error]`, so users see a localized message and the
 * underlying database/provider detail never leaks to the UI. Raw errors go to
 * Sentry instead (see logAndFail).
 */
export const ERR = {
  validation: "errors.validation",
  unexpected: "errors.unexpected",
  unauthorized: "errors.unauthorized",
} as const;

/** A failed result carrying a localized error code (a dictionary key). */
export function fail(code: string): ActionResult {
  return { ok: false, error: code };
}

/**
 * Log a raw/unexpected error (DB, provider, network) to Sentry and return a
 * safe, localized code. Never return the raw message to the client.
 */
export function logAndFail(raw: unknown, code: string = ERR.unexpected): ActionResult {
  Sentry.captureException(raw);
  return { ok: false, error: code };
}

/**
 * Validate `input` against a zod schema. On success returns the parsed data; on
 * failure returns a ready-to-send ActionResult with a localized code (the
 * schema's own message when it is a dictionary key, else `errors.validation`).
 */
export function validate<T>(
  schema: z.ZodType<T>,
  input: unknown,
): { ok: true; data: T } | { ok: false; result: ActionResult } {
  const parsed = schema.safeParse(input);
  if (parsed.success) return { ok: true, data: parsed.data };
  const first = parsed.error.issues[0]?.message;
  const code = first && first.includes(".") ? first : ERR.validation;
  return { ok: false, result: fail(code) };
}
