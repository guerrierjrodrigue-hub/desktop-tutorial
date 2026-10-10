import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { isFreeMode } from "@/lib/flags";
import type { DictionaryKey } from "@/i18n/dictionaries/en";

export const footerColumns: {
  titleKey: DictionaryKey;
  links: { labelKey: DictionaryKey; href: string }[];
}[] = [
  {
    titleKey: "mkt.footer.product",
    links: [
      { labelKey: "mkt.nav.features", href: "/#features" },
      { labelKey: "mkt.footer.programs", href: "/fitness" },
      { labelKey: "mkt.nav.barnabas", href: "/#barnabas" },
      { labelKey: "mkt.nav.pricing", href: "/pricing" },
    ],
  },
  {
    titleKey: "mkt.footer.company",
    links: [
      { labelKey: "mkt.footer.about", href: "/about" },
      { labelKey: "mkt.footer.mission", href: "/about#mission" },
      { labelKey: "mkt.footer.careers", href: "/careers" },
      { labelKey: "mkt.footer.contact", href: "/contact" },
    ],
  },
  {
    titleKey: "mkt.footer.resources",
    links: [
      { labelKey: "mkt.footer.blog", href: "/blog" },
      { labelKey: "mkt.footer.devotionals", href: "/spiritual" },
      { labelKey: "mkt.footer.help", href: "/help" },
      { labelKey: "mkt.footer.community", href: "/community" },
    ],
  },
  {
    titleKey: "mkt.footer.legal",
    links: [
      { labelKey: "mkt.footer.privacy", href: "/privacy" },
      { labelKey: "mkt.footer.terms", href: "/terms" },
      { labelKey: "mkt.footer.cookies", href: "/cookies" },
    ],
  },
];

export async function MarketingFooter() {
  const dict = await getDictionary(await getLocale());

  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            {dict["mkt.footer.missionStatement"]}
          </p>
        </div>
        {footerColumns.map((col) => (
          <div key={col.titleKey}>
            <h4 className="text-sm font-semibold text-foreground">{dict[col.titleKey]}</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-accent-bright">
                    {dict[link.labelKey]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-faint sm:flex-row">
          <p>
            © {new Date().getFullYear()} Kingdom Athlete. {dict["mkt.footer.rights"]}
          </p>
          {/* Visible only in APP_FREE_MODE — a reminder to disable it before the
              real paid launch. */}
          {isFreeMode() && (
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent-bright">
              {dict["mkt.freeMode.footerBadge"]}
            </span>
          )}
          <p className="italic">{dict["mkt.tagline"]}</p>
        </div>
      </div>
    </footer>
  );
}
