import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

/** Kingdom Athlete wordmark with a crown/mountain glyph. */
export function Logo({
  className,
  href = "/",
  showText = true,
}: {
  className?: string;
  href?: string;
  showText?: boolean;
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-accent-bright to-accent-deep text-accent-fg shadow-[0_6px_20px_-6px_rgba(0,0,0,0.5)]">
        <Glyph />
      </span>
      {showText && (
        <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
          Kingdom<span className="text-accent-bright"> Athlete</span>
          <span className="sr-only">{APP_NAME}</span>
        </span>
      )}
    </Link>
  );
}

function Glyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      {/* Golden crown — kingdom + royalty */}
      <path d="M3 8l3.8 2.8L12 5l5.2 5.8L21 8l-1.4 7.5H4.4L3 8Z" />
      <rect x="4.2" y="16.4" width="15.6" height="2.4" rx="0.7" />
    </svg>
  );
}
