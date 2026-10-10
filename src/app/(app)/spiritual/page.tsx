import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Brain, HandHeart, ArrowRight } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrayerJournal } from "@/components/spiritual/prayer-journal";
import { ReadingPlans } from "@/components/spiritual/reading-plans";
import { getDailyDevotional } from "@/data/devotional";
import {
  getPrayerRequests,
  getReadingPlans,
  getMemoryVerses,
} from "@/lib/queries/spiritual";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { timed } from "@/lib/perf";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["meta.spiritual"],
    description: "Bible reading plans, devotionals, prayer journal, and verse memorization.",
  };
}

export default async function SpiritualPage() {
  const locale = await getLocale();
  const [prayers, dict, plans, verses] = await timed("spiritual", () =>
    Promise.all([
      getPrayerRequests(),
      getDictionary(locale),
      getReadingPlans(locale),
      getMemoryVerses(locale),
    ]),
  );
  const { verse, reflection, prayer } = getDailyDevotional(locale);

  return (
    <>
      <Topbar title={dict["spiritual.title"]} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <PageHeader
          title={dict["spiritual.title"]}
          subtitle={dict["spiritual.subtitle"]}
        />

        {/* Read the full Bible */}
        <Link href="/spiritual/bible" className="block">
          <Card className="mb-5 flex items-center justify-between gap-4 bg-gradient-to-br from-gold/10 to-surface transition hover:border-gold/30">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold-bright">
                <BookOpen className="size-5" />
              </span>
              <div>
                <h3 className="font-serif text-lg font-semibold leading-tight">
                  {dict["spiritual.bible"]}
                </h3>
                <p className="text-sm text-muted">{dict["spiritual.bibleSubtitle"]}</p>
              </div>
            </div>
            <ArrowRight className="size-5 shrink-0 text-faint" />
          </Card>
        </Link>

        {/* Today's devotional */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-deep/50 to-surface">
          <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative">
            <Badge variant="gold">
              <BookOpen className="size-3" /> {dict["spiritual.todaysDevotional"]}
            </Badge>
            <blockquote className="mt-4 max-w-3xl font-serif text-2xl leading-snug">
              “{verse.text}”
            </blockquote>
            <p className="mt-3 text-sm font-semibold text-gold-bright">
              {verse.reference} · {verse.translation}
            </p>
            <p className="mt-4 max-w-2xl text-muted">{reflection}</p>
            <div className="mt-5 rounded-xl border border-border bg-black/20 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                <HandHeart className="size-4" /> {dict["spiritual.prayer"]}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{prayer}</p>
            </div>
            <Button className="mt-5">{dict["spiritual.markComplete"]}</Button>
          </div>
        </Card>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {/* Reading plans */}
          <div className="space-y-5 lg:col-span-2">
            <ReadingPlans initial={plans} dict={dict} />

            {/* Memory verses */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="inline-flex items-center gap-2">
                    <Brain className="size-4" /> {dict["spiritual.verseMemorization"]}
                  </span>
                </CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {verses.map((v) => (
                  <div
                    key={v.key}
                    className="rounded-xl border border-border bg-surface-2 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gold-bright">
                        {v.reference}
                      </p>
                      <span className="text-xs text-muted">
                        {Math.round(v.mastery * 100)}% {dict["spiritual.mastered"]}
                      </span>
                    </div>
                    <p className="mt-1.5 font-serif text-sm italic text-foreground/90">
                      “{v.text}”
                    </p>
                    <Progress
                      value={v.mastery}
                      className="mt-3 h-1.5"
                      barClassName="from-green to-green-bright"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Prayer journal */}
          <div>
            <PrayerJournal initial={prayers} dict={dict} />
          </div>
        </div>
      </main>
    </>
  );
}
