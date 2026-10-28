import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { LocaleToggle } from "@/components/marketing/locale-toggle";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function MarketingNav() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <header className="sticky top-0 z-40">
      <div className="glass mx-auto mt-4 flex h-14 max-w-6xl items-center justify-between rounded-full border border-border px-4 sm:px-6">
        <Link href="/" aria-label="Kingdom Athlete" className="inline-flex items-center gap-2.5">
          <Logo variant="mark" height={34} />
          <Logo variant="inline" height={22} className="hidden text-foreground sm:block" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <Link href="/#features" className="transition hover:text-foreground">
            {dict["mkt.nav.features"]}
          </Link>
          <Link href="/pricing" className="transition hover:text-foreground">
            {dict["mkt.nav.pricing"]}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LocaleToggle current={locale} label={dict["mkt.nav.language"]} />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              {dict["mkt.nav.signIn"]}
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">{dict["mkt.cta.tryFree"]}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
