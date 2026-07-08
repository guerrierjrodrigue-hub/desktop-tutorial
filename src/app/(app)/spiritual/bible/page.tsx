import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { BibleControls } from "@/components/spiritual/bible-controls";
import {
  BIBLE_TRANSLATIONS,
  getBibleBooks,
  getBibleChapter,
  isBibleTranslationId,
  type BibleTranslationId,
} from "@/lib/bible";

export const metadata: Metadata = {
  title: "Bible",
  description: "Read the complete Bible in French (Louis Segond 1910) or English (World English Bible).",
};

function hrefFor(t: BibleTranslationId, b: string, c: number) {
  return `/spiritual/bible?t=${t}&b=${b}&c=${c}`;
}

export default async function BiblePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; b?: string; c?: string }>;
}) {
  const params = await searchParams;
  const translationId: BibleTranslationId =
    params.t && isBibleTranslationId(params.t) ? params.t : BIBLE_TRANSLATIONS[0].id;

  const books = await getBibleBooks(translationId);
  const bookId = params.b && books.some((b) => b.id === params.b) ? params.b! : (books[0]?.id ?? "GEN");
  const book = books.find((b) => b.id === bookId);
  const numberOfChapters = book?.numberOfChapters ?? 1;

  const requestedChapter = Number(params.c) || 1;
  const chapterNumber = Math.min(Math.max(1, requestedChapter), numberOfChapters);

  const chapter = books.length
    ? await getBibleChapter(translationId, bookId, chapterNumber, numberOfChapters)
    : null;

  const bookIndex = books.findIndex((b) => b.id === bookId);
  const prev =
    chapterNumber > 1
      ? hrefFor(translationId, bookId, chapterNumber - 1)
      : bookIndex > 0
        ? hrefFor(translationId, books[bookIndex - 1].id, books[bookIndex - 1].numberOfChapters)
        : null;
  const next =
    chapterNumber < numberOfChapters
      ? hrefFor(translationId, bookId, chapterNumber + 1)
      : bookIndex >= 0 && bookIndex < books.length - 1
        ? hrefFor(translationId, books[bookIndex + 1].id, 1)
        : null;

  return (
    <>
      <Topbar title="Bible" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
        <PageHeader
          title="Bible"
          subtitle="The complete Bible, free to read — Louis Segond 1910 (French) and the World English Bible."
        />

        <Card>
          <BibleControls
            translationId={translationId}
            books={books}
            bookId={bookId}
            chapterNumber={chapterNumber}
            numberOfChapters={numberOfChapters}
          />
        </Card>

        <Card className="mt-5">
          {!books.length || !chapter ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <BookOpen className="size-6 text-faint" />
              <p className="text-sm text-muted">
                The Bible couldn&apos;t be loaded right now — check your connection and try again.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl font-semibold">
                {chapter.bookName} {chapter.chapterNumber}
              </h2>
              <div className="mt-5 space-y-3 leading-relaxed">
                {chapter.content.map((block, i) =>
                  block.type === "heading" ? (
                    <h3
                      key={i}
                      className="!mt-6 font-serif text-lg font-semibold text-gold-bright first:!mt-0"
                    >
                      {block.text}
                    </h3>
                  ) : (
                    <p key={i}>
                      <sup className="mr-1 text-xs font-semibold text-faint">{block.number}</sup>
                      {block.text}
                    </p>
                  ),
                )}
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
                {prev ? (
                  <Link
                    href={prev}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-gold-bright hover:underline"
                  >
                    <ChevronLeft className="size-4" /> Previous
                  </Link>
                ) : (
                  <span />
                )}
                {next ? (
                  <Link
                    href={next}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-gold-bright hover:underline"
                  >
                    Next <ChevronRight className="size-4" />
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            </>
          )}
        </Card>
      </main>
    </>
  );
}
