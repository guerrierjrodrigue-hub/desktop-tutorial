/** Standard result shape returned by write server actions. */
export interface ActionResult {
  ok: boolean;
  /** True when Supabase is not configured and the write was a demo no-op. */
  demo?: boolean;
  error?: string;
}

export const demoOk: ActionResult = { ok: true, demo: true };
