"use client";

import { Share2 } from "lucide-react";

/** Shares an Instagram-story image of the user's current streak (Web Share API,
 * with a new-tab fallback where sharing isn't available). */
export function ShareStreakButton({
  streak,
  label,
  caption,
}: {
  streak: number;
  label: string;
  caption: string;
}) {
  async function share() {
    const url = `/api/share-image?type=streak&value=${streak}&label=${encodeURIComponent(caption)}`;
    const absolute = typeof window !== "undefined" ? new URL(url, window.location.origin).toString() : url;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: label, text: caption, url: absolute });
        return;
      }
    } catch {
      // fall through to opening the image
    }
    if (typeof window !== "undefined") window.open(absolute, "_blank", "noopener");
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted transition hover:border-gold/30 hover:text-foreground"
    >
      <Share2 className="size-3.5" /> {label}
    </button>
  );
}
