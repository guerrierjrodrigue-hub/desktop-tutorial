"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMobileNavItems } from "@/lib/nav";
import { getPurposeNavItem } from "@/lib/personalization";
import { cn } from "@/lib/utils";

export function MobileNav({ identities }: { identities: string[] }) {
  const pathname = usePathname();
  const items = getMobileNavItems(getPurposeNavItem(identities));

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border pb-[env(safe-area-inset-bottom)] lg:hidden">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              active ? "text-gold-bright" : "text-faint",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
