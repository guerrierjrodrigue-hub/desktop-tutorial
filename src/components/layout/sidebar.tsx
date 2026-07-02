"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-border bg-surface/40 px-4 py-6 lg:flex">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
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
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-gold/20 bg-gradient-to-b from-gold/10 to-transparent p-4">
        <div className="mb-1 flex items-center gap-2 text-gold-bright">
          <Sparkles className="size-4" />
          <span className="text-sm font-semibold">Go Premium</span>
        </div>
        <p className="text-xs text-muted">
          Unlock all programs, Barnabas coaching & advanced insights.
        </p>
        <Link
          href="/pricing"
          className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold text-sm font-semibold text-background transition hover:brightness-105"
        >
          Start free trial
        </Link>
      </div>
    </aside>
  );
}
