/**
 * Temporary "everything free" mode for the real user-testing phase.
 *
 * When `APP_FREE_MODE=true`, every user is treated as premium (see
 * `getCurrentUser` in lib/queries/profile.ts) and the marketing pages swap the
 * paid plans for a free-beta banner. The monetization code is left intact —
 * flip this back to `false` (or remove the env var) to restore paid plans.
 *
 * Server-only flag (not `NEXT_PUBLIC_`): it is read in Server Components and
 * server queries, never shipped to the client. Defaults to off when unset.
 */
export function isFreeMode(): boolean {
  return process.env.APP_FREE_MODE === "true";
}

/**
 * Master switch for the AI coach (Barnabas). Default OFF. When disabled, the
 * coach routes 404 without touching Anthropic, the coach pages redirect, and
 * every coach entry point / marketing promise is hidden — the code stays intact
 * so flipping the flag back on restores it.
 *
 * One helper for all code: on the server it reads `COACH_ENABLED`; in the
 * browser that var isn't inlined, so it falls back to `NEXT_PUBLIC_COACH_ENABLED`
 * (which must be set too for client components to agree). Defaults to off.
 */
export function isCoachEnabled(): boolean {
  const server = process.env.COACH_ENABLED;
  const pub = process.env.NEXT_PUBLIC_COACH_ENABLED;
  return (server ?? pub) === "true";
}
