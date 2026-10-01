"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";

interface RevealProps extends ComponentPropsWithoutRef<"div"> {
  delay?: number;
}

/**
 * Fade + rise into view once.
 *
 * Content is VISIBLE by default — the server HTML never hides anything, so
 * there is no blank screen while JS loads and nothing breaks without JS.
 * After hydration, only elements that are still below the fold are tucked
 * away (`data-reveal="hidden"`) and transitioned in when scrolled into view.
 * Anything already on screen (hero, page headers, forms) is left untouched,
 * and users who prefer reduced motion get no animation at all (see the
 * `[data-reveal]` rules in globals.css).
 */
export function Reveal({ delay = 0, style, children, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already visible at hydration → never hide it.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.dataset.reveal = "shown";
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}s` }}
      {...props}
    >
      {children}
    </div>
  );
}
