import Link from "next/link";
import { BookOpen, HandHeart } from "lucide-react";
import { dailyDevotional } from "@/data/devotional";
import { Card } from "@/components/ui/card";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function DevotionalCard() {
  const { verse, prayer, quote } = dailyDevotional;
  const dict = await getDictionary(await getLocale());
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-green-deep/60 to-surface">
      <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-gold/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-gold-bright">
          <BookOpen className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            {dict["spiritual.verseOfDay"]}
          </span>
        </div>
        <blockquote className="mt-3 font-serif text-xl leading-snug">
          “{verse.text}”
        </blockquote>
        <p className="mt-3 text-sm font-medium text-gold-bright">
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

        <Link
          href="/spiritual"
          className="mt-4 inline-flex text-sm font-semibold text-gold-bright hover:underline"
        >
          {dict["spiritual.openDevotional"]} →
        </Link>
      </div>
    </Card>
  );
}
