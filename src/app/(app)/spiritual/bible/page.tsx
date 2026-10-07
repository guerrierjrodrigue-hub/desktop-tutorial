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
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["bible.metaTitle"],
    description: dict["bible.metaDescription"],
  };
}

function hrefFor(t: BibleTranslationId, b: string, c: number) {
  return `/spiritual/bible?t=${t}&b=${b}&c=${c}`;
}

export default async function BiblePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; b?: string; c?: string }>;
}) {
  const params = await searchParams;
  const dict = await getDictionary(await getLocale());
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
      <Topbar title={dict["bible.title"]} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
        <PageHeader
          title={dict["bible.title"]}
          subtitle={dict["bible.subtitle"]}
        />

        <Card>
          <BibleControls
            translationId={translationId}
            books={books}
            bookId={bookId}
            chapterNumber={chapterNumber}
            numberOfChapters={numberOfChapters}
            dict={dict}
          />
        </Card>

        <Card className="mt-5">
          {!books.length || !chapter ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <BookOpen className="size-6 text-faint" />
              <p className="text-sm text-muted">{dict["bible.error"]}</p>
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
                    <ChevronLeft className="size-4" /> {dict["bible.previous"]}
                  </Link>
                ) : (
                  <span />
                )}
                {next ? (
                  <Link
                    href={next}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-gold-bright hover:underline"
                  >
                    {dict["bible.next"]} <ChevronRight className="size-4" />
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
