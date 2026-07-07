import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { APP_MISSION } from "@/lib/constants";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Programs", href: "/fitness" },
      { label: "Barnabas AI", href: "/#barnabas" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Mission", href: "/about#mission" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Devotionals", href: "/spiritual" },
      { label: "Help Center", href: "/help" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">{APP_MISSION}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition hover:text-gold-bright">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Kingdom Athlete. All rights reserved.</p>
          <p className="italic">Strengthen Your Body. Grow Your Faith.</p>
        </div>
      </div>
    </footer>
  );
}
