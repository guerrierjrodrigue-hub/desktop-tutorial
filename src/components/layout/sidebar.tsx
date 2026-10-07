"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import {
  dashboardNavItem,
  getNavGroups,
  standaloneNavItems,
  type NavItem,
} from "@/lib/nav";
import { getPurposeNavItem } from "@/lib/personalization";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Sparkles, ShieldCheck } from "lucide-react";

function navLabel(item: NavItem, dict: Dictionary): string {
  return item.labelKey ? dict[item.labelKey] : item.label;
}

function NavLink({ item, active, dict }: { item: NavItem; active: boolean; dict: Dictionary }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-surface-2 text-foreground"
          : "text-muted hover:bg-surface-2/60 hover:text-foreground",
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full border-l-2 border-gold" />
      )}
      <item.icon
        className={cn(
          "size-5",
          active ? "text-gold-bright" : "text-faint group-hover:text-foreground",
        )}
      />
      {navLabel(item, dict)}
    </Link>
  );
}

export function Sidebar({
  identities,
  dict,
  freeMode = false,
}: {
  identities: string[];
  dict: Dictionary;
  freeMode?: boolean;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");
  const groups = getNavGroups(getPurposeNavItem(identities));

  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface/40 px-4 py-6 lg:flex">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        <NavLink item={dashboardNavItem} active={isActive(dashboardNavItem.href)} dict={dict} />

        {groups.map((group) => (
          <div key={group.id} className="mt-4 first:mt-0">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-faint">
              {group.labelKey ? dict[group.labelKey] : group.label}
            </p>
            <div className="mt-1 flex flex-col gap-1">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(item.href)} dict={dict} />
              ))}
            </div>
          </div>
        ))}

        <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4">
          {standaloneNavItems.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} dict={dict} />
          ))}
        </div>
      </nav>

      {!freeMode && (
        <div className="mt-4 rounded-2xl border border-gold/20 bg-gradient-to-b from-gold/10 to-transparent p-4">
          <div className="mb-1 flex items-center gap-2 text-gold-bright">
            <Sparkles className="size-4" />
            <span className="text-sm font-semibold">{dict["nav.goPremium"]}</span>
          </div>
          <p className="text-xs text-muted">{dict["nav.goPremiumBlurb"]}</p>
          <Link
            href="/pricing"
            className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold text-sm font-semibold text-background transition hover:brightness-105"
          >
            {dict["nav.startFreeTrial"]}
          </Link>
        </div>
      )}

      <Link
        href="/admin"
        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-faint transition-colors hover:bg-surface-2/60 hover:text-foreground"
      >
        <ShieldCheck className="size-5 text-faint" />
        {dict["nav.admin"]}
      </Link>
    </aside>
  );
}
