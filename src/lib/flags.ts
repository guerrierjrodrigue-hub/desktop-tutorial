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
