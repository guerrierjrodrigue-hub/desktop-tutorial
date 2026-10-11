import { Logo } from "@/components/brand/logo";

/** Instant fallback for public pages while they stream in — never a blank screen. */
export default function Loading() {
  return (
    <div
      className="grid min-h-svh place-items-center px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="logo-breathe flex flex-col items-center gap-3">
        <Logo variant="mark" height={56} />
        <Logo variant="inline" height={22} className="text-foreground" />
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
