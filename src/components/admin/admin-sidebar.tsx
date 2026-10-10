"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { adminNavItems } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-border bg-surface/40 px-4 py-6 lg:flex">
      <Logo />
      <div className="mt-6 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/8 px-3 py-2 text-xs font-semibold text-accent-bright">
        <ShieldCheck className="size-4" /> Admin console
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {adminNavItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-surface-2 text-foreground"
                  : "text-muted hover:bg-surface-2/60 hover:text-foreground",
              )}
            >
              <item.icon
                className={cn("size-5", active ? "text-accent-bright" : "text-faint")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to app
      </Link>
    </aside>
  );
}
