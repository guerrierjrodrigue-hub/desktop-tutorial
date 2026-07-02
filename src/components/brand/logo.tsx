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
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-gold-bright to-gold-deep text-background shadow-[0_6px_20px_-6px_rgba(212,175,55,0.6)]">
        <Glyph />
      </span>
      {showText && (
        <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
          Kingdom<span className="text-gold-bright"> Athlete</span>
          <span className="sr-only">{APP_NAME}</span>
        </span>
      )}
    </Link>
  );
}

function Glyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      {/* Crown fused with a rising mountain — kingdom + strength */}
      <path
        d="M3 18h18l-1.4-8.2-3.7 3.1L12 6l-3.9 6.9-3.7-3.1L3 18Z"
        fill="currentColor"
      />
    </svg>
  );
}
