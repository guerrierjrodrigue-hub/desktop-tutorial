import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Careers",
  description: "Kingdom Athlete is a small, independent team — here's how to reach out.",
};

export default function CareersPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-8 pt-20 text-center">
          <Reveal>
            <Badge variant="gold">Careers</Badge>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              We&apos;re not hiring right now
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-muted">
              Kingdom Athlete is built by a small, independent team. We don&apos;t
              have open roles today, but we&apos;re always glad to hear from
              people who care about both craft and calling — keep us in mind
              as that changes.
            </p>
          </Reveal>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <Reveal className="glass rounded-2xl border border-border p-6 text-center">
            <p className="text-sm text-muted">
              Want to say hello anyway?{" "}
              <a
                href={`mailto:${APP_SUPPORT_EMAIL}?subject=${encodeURIComponent("Hello from a future teammate")}`}
                className="font-medium text-gold-bright hover:underline"
              >
                Email us
              </a>{" "}
              — we read everything, even if we can&apos;t always reply quickly.
            </p>
          </Reveal>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-20">
          <Reveal className="glass ring-gold relative overflow-hidden rounded-3xl border border-gold/20 px-8 py-12 text-center sm:px-12">
            <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              Curious what we&apos;re building?
            </h2>
            <div className="mt-6 flex justify-center">
              <Link href="/about">
                <Button variant="secondary">Read our story</Button>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
