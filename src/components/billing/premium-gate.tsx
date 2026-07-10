import Link from "next/link";
import { Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Full-width upsell shown when a non-premium user opens premium content. */
export function PremiumGate({
  title = "This is a Premium program",
  perks = [
    "Every program & workout",
    "Unlimited Barnabas AI coaching",
    "Nutrition & macro tools",
  ],
}: {
  title?: string;
  perks?: string[];
}) {
  return (
    <div className="glass ring-gold mt-8 overflow-hidden rounded-3xl border border-gold/25 p-8 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-gold-bright to-gold-deep text-background">
        <Crown className="size-7" />
      </span>
      <h2 className="mt-4 font-serif text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-muted">
        Unlock it with Kingdom Athlete Premium — and start with 1 month
        free.
      </p>
      <ul className="mx-auto mt-6 flex max-w-xs flex-col gap-2 text-left text-sm">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-2.5">
            <Check className="size-4 shrink-0 text-gold-bright" />
            <span className="text-muted">{p}</span>
          </li>
        ))}
      </ul>
      <Link href="/pricing" className="mt-7 inline-block">
        <Button size="lg">
          <Crown className="size-4" /> Start free trial
        </Button>
      </Link>
    </div>
  );
}
