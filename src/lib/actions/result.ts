/** Standard result shape returned by write server actions. */
export interface ActionResult {
  ok: boolean;
  /** True when Supabase is not configured and the write was a demo no-op. */
  demo?: boolean;
  error?: string;
  /** XP awarded by this action (for the "+N XP" confirmation), when applicable. */
  xp?: number;
  /**
   * The real database id of the row a create action just inserted. The client
   * swaps its temporary optimistic id for this, so an immediate edit/delete
   * targets the real row instead of a phantom temp id.
   */
  id?: string;
}

export const demoOk: ActionResult = { ok: true, demo: true };
