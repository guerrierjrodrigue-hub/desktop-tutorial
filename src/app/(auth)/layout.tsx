import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { APP_TAGLINE } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-border bg-gradient-to-br from-green-deep via-background to-background p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-20 top-10 size-80 rounded-full bg-gold/10 blur-3xl" />
        <Logo />
        <div className="relative">
          <blockquote className="max-w-md font-serif text-3xl font-medium leading-snug">
            “Do you not know that your bodies are temples of the Holy Spirit?
            Therefore honor God with your bodies.”
          </blockquote>
          <p className="mt-4 text-sm text-gold-bright">1 Corinthians 6:19–20</p>
        </div>
        <p className="relative text-sm text-muted">{APP_TAGLINE}</p>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col items-center justify-center px-6 py-12">
        <div className="absolute left-6 top-6 lg:hidden">
          <Logo />
        </div>
        {children}
        <p className="mt-10 text-center text-xs text-faint">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline hover:text-muted">
            Terms
          </Link>{" "}
          &{" "}
          <Link href="/privacy" className="underline hover:text-muted">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
