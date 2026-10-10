import Link from "next/link";
import { BookOpen, HandHeart } from "lucide-react";
import { getDailyDevotional } from "@/data/devotional";
import { Card } from "@/components/ui/card";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function DevotionalCard() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const { verse, prayer, quote } = getDailyDevotional(locale);
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-green-deep/60 to-surface">
      <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-accent/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-accent-bright">
          <BookOpen className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            {dict["spiritual.verseOfDay"]}
          </span>
        </div>
        <blockquote className="mt-3 font-serif text-xl leading-snug">
          “{verse.text}”
        </blockquote>
        <p className="mt-3 text-sm font-medium text-accent-bright">
          {verse.reference} · {verse.translation}
        </p>

        <div className="mt-5 rounded-xl border border-border bg-black/20 p-4">
          <div className="flex items-center gap-2 text-muted">
            <HandHeart className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              {dict["spiritual.prayerOfDay"]}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {prayer}
          </p>
        </div>

        <p className="mt-4 text-sm italic text-muted">“{quote}”</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/spiritual"
            className="inline-flex text-sm font-semibold text-accent-bright hover:underline"
          >
            {dict["spiritual.openDevotional"]} →
          </Link>
          <Link
            href="/spiritual/bible"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-bright hover:underline"
          >
            <BookOpen className="size-4" /> {dict["spiritual.readBible"]} →
          </Link>
        </div>
      </div>
    </Card>
  );
}
