"use client";

import { BIBLE_TRANSLATIONS, type BibleTranslationId, type BibleBookSummary } from "@/lib/bible";

function autoSubmit(e: React.ChangeEvent<HTMLSelectElement>) {
  e.currentTarget.form?.requestSubmit();
}

export function BibleControls({
  translationId,
  books,
  bookId,
  chapterNumber,
  numberOfChapters,
}: {
  translationId: BibleTranslationId;
  books: BibleBookSummary[];
  bookId: string;
  chapterNumber: number;
  numberOfChapters: number;
}) {
  const chapters = Array.from({ length: numberOfChapters }, (_, i) => i + 1);

  return (
    <form method="get" className="flex flex-wrap gap-2">
      <select
        name="t"
        defaultValue={translationId}
        onChange={autoSubmit}
        className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-gold/40"
      >
        {BIBLE_TRANSLATIONS.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      <select
        name="b"
        defaultValue={bookId}
        onChange={autoSubmit}
        className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-gold/40 sm:flex-none"
      >
        {books.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <select
        name="c"
        defaultValue={chapterNumber}
        onChange={autoSubmit}
        className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-gold/40"
      >
        {chapters.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <noscript>
        <button
          type="submit"
          className="h-10 rounded-lg border border-gold/40 bg-gold/10 px-4 text-sm font-semibold text-gold-bright"
        >
          Go
        </button>
      </noscript>
    </form>
  );
}
