import { z } from "zod";

/** Allowed feedback categories (mirrors the DB CHECK in migration 0045). */
export const FEEDBACK_KINDS = ["bug", "idee", "autre"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

/**
 * Validation for a feedback submission. The message bounds (5..2000) mirror the
 * DB CHECK in migration 0045 exactly, so the app is never stricter than the
 * database (Z3 rule). Error messages are dictionary keys.
 */
export const feedbackSchema = z.object({
  kind: z.enum(FEEDBACK_KINDS, { message: "errors.feedbackKind" }),
  message: z.string().trim().min(5, "errors.feedbackTooShort").max(2000, "errors.tooLong"),
  page: z.string().trim().max(300).nullish(),
  userAgent: z.string().trim().max(500).nullish(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
