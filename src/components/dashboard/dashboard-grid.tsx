"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveDashboardLayout } from "@/app/(app)/dashboard/actions";
import { cn } from "@/lib/utils";

export interface WidgetEntry {
  id: string;
  hidden: boolean;
}

interface Widget {
  id: string;
  label: string;
  node: React.ReactNode;
}

const STORAGE_KEY = "ka:dashboard-layout";

/** Merge a saved layout with the current widget set — drops stale ids, appends new ones. */
function reconcile(saved: WidgetEntry[], widgets: Widget[]): WidgetEntry[] {
  const known = new Set(widgets.map((w) => w.id));
  const merged = saved.filter((entry) => known.has(entry.id));
  for (const w of widgets) {
    if (!merged.some((entry) => entry.id === w.id)) merged.push({ id: w.id, hidden: false });
  }
  return merged;
}

export function DashboardGrid({
  widgets,
  initialLayout,
}: {
  widgets: Widget[];
  initialLayout: WidgetEntry[];
}) {
  const [layout, setLayout] = useState<WidgetEntry[]>(() => reconcile(initialLayout, widgets));
  const [customizing, setCustomizing] = useState(false);

  // Prefer a locally-saved layout (works even in demo mode with no backend).
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const t = setTimeout(() => {
      try {
        setLayout(reconcile(JSON.parse(saved), widgets));
      } catch {
        // ignore malformed local storage
      }
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(next: WidgetEntry[]) {
    setLayout(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    saveDashboardLayout(next).catch(() => {});
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= layout.length) return;
    const next = [...layout];
    [next[index], next[target]] = [next[target], next[index]];
    persist(next);
  }

  function toggleHidden(id: string) {
    persist(layout.map((entry) => (entry.id === id ? { ...entry, hidden: !entry.hidden } : entry)));
  }

  const widgetMap = new Map(widgets.map((w) => [w.id, w]));

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => setCustomizing((v) => !v)}>
          <Settings2 className="size-4" /> {customizing ? "Done" : "Customize"}
        </Button>
      </div>

      {customizing && (
        <div className="mb-5 space-y-2 rounded-2xl border border-border bg-surface-2 p-4">
          {layout.map((entry, i) => {
            const widget = widgetMap.get(entry.id);
            if (!widget) return null;
            return (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2"
              >
                <span className={cn("text-sm font-medium", entry.hidden && "text-faint line-through")}>
                  {widget.label}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label={`Move ${widget.label} up`}
                    className="grid size-7 place-items-center rounded-md text-muted transition hover:bg-elevated disabled:opacity-30"
                  >
                    <ChevronUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === layout.length - 1}
                    aria-label={`Move ${widget.label} down`}
                    className="grid size-7 place-items-center rounded-md text-muted transition hover:bg-elevated disabled:opacity-30"
                  >
                    <ChevronDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleHidden(entry.id)}
                    aria-label={entry.hidden ? `Show ${widget.label}` : `Hide ${widget.label}`}
                    className="grid size-7 place-items-center rounded-md text-muted transition hover:bg-elevated"
                  >
                    {entry.hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {layout
          .filter((entry) => !entry.hidden)
          .map((entry) => {
            const widget = widgetMap.get(entry.id);
            return widget ? <div key={entry.id}>{widget.node}</div> : null;
          })}
      </div>
    </div>
  );
}
