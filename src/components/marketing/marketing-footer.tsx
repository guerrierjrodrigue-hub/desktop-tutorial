import { Logo } from "@/components/brand/logo";
import { APP_MISSION } from "@/lib/constants";

const columns = [
  {
    title: "Product",
    links: ["Features", "Programs", "Barnabas AI", "Pricing"],
  },
  { title: "Company", links: ["About", "Mission", "Careers", "Contact"] },
  { title: "Resources", links: ["Blog", "Devotionals", "Help Center", "Community"] },
  { title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
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
                <li key={link}>
                  <a href="#" className="transition hover:text-gold-bright">
                    {link}
                  </a>
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
