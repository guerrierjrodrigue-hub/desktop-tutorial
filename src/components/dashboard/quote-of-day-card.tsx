import { Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getQuoteOfDay } from "@/lib/quote-of-day";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function QuoteOfDayCard() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const quote = getQuoteOfDay(locale);

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-gold/10 to-surface">
      <div className="flex items-center gap-2 text-gold-bright">
        <Quote className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {dict["dashboard.quoteOfDay"]}
        </span>
      </div>
      <blockquote className="mt-3 font-serif text-lg italic leading-snug">
        “{quote}”
      </blockquote>
    </Card>
  );
}
