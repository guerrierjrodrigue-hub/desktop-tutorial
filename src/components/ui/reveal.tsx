"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stagger, in seconds, applied as the CSS transition-delay. */
  delay?: number;
}

/**
 * Scroll-reveal that is **visible by default**.
 *
 * The hidden/offset state is applied only by JS, after mount, and only to
 * elements that are still below the fold. Consequences:
 *   - Server HTML paints fully visible — content is never stuck invisible
 *     waiting for hydration, so no page flashes black on load (see globals.css).
 *   - Above-the-fold content (already in view on mount) stays visible with no
 *     entrance animation and no flash.
 *   - If JS never runs, everything simply stays visible.
 *   - `prefers-reduced-motion` skips the animation entirely.
 */
export function Reveal({
  delay = 0,
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // "visible" is the SSR-safe default. JS may switch an off-screen element to
  // "pending" (hidden) and back to "visible" once it scrolls into view.
  const [state, setState] = useState<"visible" | "pending">("visible");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion: never animate, stay visible.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Already in view on mount (e.g. above the fold): keep visible, no entrance.
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight - 80 && rect.bottom > 0;
    if (inView) return;

    setState("pending");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setState("visible");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={state}
      className={cn("reveal", className)}
      style={delay ? { ...style, transitionDelay: `${delay}s` } : style}
      {...props}
    >
      {children}
    </div>
  );
}
