import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Globe, TrendingUp, Coffee } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the team building Kingdom Athlete.",
};

const perks = [
  {
    icon: Globe,
    title: "Remote-first",
    body: "We hire across time zones and meet in person twice a year.",
  },
  {
    icon: Heart,
    title: "Mission over metrics",
    body: "We measure success in disciplines built, not just dashboards.",
  },
  {
    icon: TrendingUp,
    title: "Room to grow",
    body: "Small team, big scope — you'll own things, not just tickets.",
  },
  {
    icon: Coffee,
    title: "Sane pace",
    body: "No burnout culture. We train our bodies; we rest them too.",
  },
];

const roles = [
  {
    title: "Senior Backend Engineer",
    location: "Remote (US/EU hours)",
    type: "Full-time",
    body: "Own our Supabase data layer, billing pipeline, and API surface as we scale past our first 100K athletes.",
  },
  {
    title: "Content & Devotional Writer",
    location: "Remote",
    type: "Contract",
    body: "Write daily devotionals, reading plans, and Barnabas's voice — biblically grounded, warm, never preachy.",
  },
];

export default function CareersPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-8 pt-20 text-center">
          <Reveal>
            <Badge variant="gold">Careers</Badge>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Build the future of faith-driven fitness
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-muted">
              We&apos;re a small, remote team on a mission to help believers
              train body and soul. If that sounds like your kind of work, we&apos;d
              love to meet you.
            </p>
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.05}>
                <div className="glass h-full rounded-2xl border border-border p-6">
                  <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-gold/15 to-transparent text-gold-bright ring-1 ring-gold/20">
                    <p.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <Reveal>
            <h2 className="mb-6 text-center font-serif text-2xl font-semibold">
              Open roles
            </h2>
          </Reveal>
          <div className="space-y-4">
            {roles.map((role, i) => (
              <Reveal key={role.title} delay={i * 0.05}>
                <div className="glass rounded-2xl border border-border p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">{role.title}</h3>
                    <span className="text-xs text-faint">
                      {role.location} · {role.type}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{role.body}</p>
                  <a
                    href={`mailto:${APP_SUPPORT_EMAIL}?subject=${encodeURIComponent(
                      `Application: ${role.title}`,
                    )}`}
                    className="mt-4 inline-block text-sm font-medium text-gold-bright hover:underline"
                  >
                    Apply for this role →
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="glass mt-6 rounded-2xl border border-border p-6 text-center">
            <p className="text-sm text-muted">
              Don&apos;t see the right role?{" "}
              <Link href="/contact" className="font-medium text-gold-bright hover:underline">
                Reach out anyway
              </Link>{" "}
              — we&apos;re always glad to meet people who care about this mission.
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
