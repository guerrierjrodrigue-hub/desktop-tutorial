const BIBLE_API_BASE = "https://bible.helloao.org/api";

/**
 * Two public-domain translations via the free, keyless bible.helloao.org API:
 * Louis Segond 1910 (French) and the World English Bible (English).
 */
export const BIBLE_TRANSLATIONS = [
  { id: "fra_lsg", label: "Français — Louis Segond 1910" },
  { id: "ENGWEBP", label: "English — World English Bible" },
] as const;

export type BibleTranslationId = (typeof BIBLE_TRANSLATIONS)[number]["id"];

export function isBibleTranslationId(value: string): value is BibleTranslationId {
  return BIBLE_TRANSLATIONS.some((t) => t.id === value);
}

export interface BibleBookSummary {
  id: string;
  name: string;
  numberOfChapters: number;
  order: number;
}

export type BibleContentBlock =
  | { type: "heading"; text: string }
  | { type: "verse"; number: number; text: string };

export interface BibleChapter {
  bookId: string;
  bookName: string;
  chapterNumber: number;
  numberOfChapters: number;
  content: BibleContentBlock[];
}

/** A year — Bible text never changes, so cache aggressively. */
const REVALIDATE_SECONDS = 60 * 60 * 24 * 365;

interface RawBooksResponse {
  books?: {
    id: string;
    name: string;
    commonName?: string;
    numberOfChapters: number;
    order: number;
  }[];
}

/** The full book list for a translation, in canonical order (demo-safe: returns [] on any failure). */
export async function getBibleBooks(translationId: BibleTranslationId): Promise<BibleBookSummary[]> {
  try {
    const res = await fetch(`${BIBLE_API_BASE}/${translationId}/books.json`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as RawBooksResponse;
    return (data.books ?? [])
      .map((b) => ({
        id: b.id,
        name: b.commonName ?? b.name,
        numberOfChapters: b.numberOfChapters,
        order: b.order,
      }))
      .sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

interface RawChapterResponse {
  book?: { id: string; name: string; commonName?: string };
  chapter?: {
    number: number;
    content?: { type: string; number?: number; content?: unknown[] }[];
  };
}

function joinText(content: unknown[] | undefined): string {
  return (content ?? []).filter((x): x is string => typeof x === "string").join(" ");
}

/** One chapter's content (headings + verses, in reading order). Returns null when unavailable. */
export async function getBibleChapter(
  translationId: BibleTranslationId,
  bookId: string,
  chapterNumber: number,
  numberOfChapters: number,
): Promise<BibleChapter | null> {
  try {
    const res = await fetch(`${BIBLE_API_BASE}/${translationId}/${bookId}/${chapterNumber}.json`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as RawChapterResponse;
    if (!data.chapter) return null;

    const content: BibleContentBlock[] = [];
    for (const block of data.chapter.content ?? []) {
      if (block.type === "heading") {
        const text = joinText(block.content);
        if (text) content.push({ type: "heading", text });
      } else if (block.type === "verse" && typeof block.number === "number") {
        content.push({ type: "verse", number: block.number, text: joinText(block.content) });
      }
    }

    return {
      bookId: data.book?.id ?? bookId,
      bookName: data.book?.commonName ?? data.book?.name ?? bookId,
      chapterNumber: data.chapter.number ?? chapterNumber,
      numberOfChapters,
      content,
    };
  } catch {
    return null;
  }
}
