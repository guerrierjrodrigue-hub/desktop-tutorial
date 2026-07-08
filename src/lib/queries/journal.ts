import { getAuthedContext } from "@/lib/supabase/auth";
import { journalEntries as mockEntries } from "@/data/journal";
import type { JournalEntry } from "@/types";
import type { JournalEntryRow } from "@/types/database";

function mapEntry(row: JournalEntryRow): JournalEntry {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
  };
}

/** The signed-in user's journal entries (demo data when unconfigured). */
export async function getJournalEntries(): Promise<JournalEntry[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return mockEntries;

  const { data } = await ctx.supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false });

  return data ? data.map(mapEntry) : mockEntries;
}
