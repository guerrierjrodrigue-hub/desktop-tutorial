"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import type { AppNotification } from "@/data/notifications";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

const accentClass: Record<string, string> = {
  accent: "bg-accent/15 text-accent-bright",
  green: "bg-green/25 text-green-bright",
  ember: "bg-ember/20 text-ember",
};

export function NotificationsBell({
  initial,
  dict,
}: {
  initial: AppNotification[];
  dict: Dictionary;
}) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => !n.read).length;

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-foreground"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-xs font-bold text-accent-fg">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="glass absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-border shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold">{dict["notifications.title"]}</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-accent-bright hover:underline"
              >
                <Check className="size-3.5" /> {dict["notifications.markAllRead"]}
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              {dict["notifications.empty"]}
            </p>
          ) : (
          <ul className="max-h-96 overflow-y-auto">
            {items.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "flex gap-3 border-b border-border/60 px-4 py-3 transition last:border-0",
                  !n.read && "bg-accent/5",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-lg",
                    accentClass[n.accent],
                  )}
                >
                  <Icon name={n.icon} className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{n.body}</p>
                  <p className="mt-1 text-xs text-faint">{n.time}</p>
                </div>
                {!n.read && (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
                )}
              </li>
            ))}
          </ul>
          )}
        </div>
      )}
    </div>
  );
}
