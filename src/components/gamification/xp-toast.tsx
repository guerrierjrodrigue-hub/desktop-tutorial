"use client";

import { useEffect, useState } from "react";

const EVENT = "ka:xp";

/** Fire a "+N XP" toast. No-op for falsy/zero amounts. Safe on the server. */
export function showXp(xp?: number): void {
  if (!xp || xp <= 0 || typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: xp }));
}

interface XpToast {
  id: number;
  xp: number;
}

/** Listens for XP events and shows transient "+N XP" pills. Mounted once. */
export function XpToaster() {
  const [toasts, setToasts] = useState<XpToast[]>([]);

  useEffect(() => {
    let seq = 0;
    function onXp(e: Event) {
      const xp = (e as CustomEvent<number>).detail;
      if (!xp) return;
      const id = ++seq;
      setToasts((prev) => [...prev, { id, xp }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2200);
    }
    window.addEventListener(EVENT, onXp);
    return () => window.removeEventListener(EVENT, onXp);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 lg:bottom-8"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="xp-toast rounded-full border border-accent/30 bg-surface-2/95 px-4 py-2 text-sm font-semibold text-accent-bright shadow-lg"
        >
          +{t.xp} XP
        </div>
      ))}
    </div>
  );
}
