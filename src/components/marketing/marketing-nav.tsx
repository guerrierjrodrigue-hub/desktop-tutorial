import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40">
      <div className="glass mx-auto mt-4 flex h-14 max-w-6xl items-center justify-between rounded-full border border-border px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#features" className="transition hover:text-foreground">
            Features
          </a>
          <a href="#barnabas" className="transition hover:text-foreground">
            Barnabas AI
          </a>
          <a href="#pricing" className="transition hover:text-foreground">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Sign in
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">Start free</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
