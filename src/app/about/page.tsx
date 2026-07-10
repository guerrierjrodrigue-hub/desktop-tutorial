import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, Dumbbell, BookOpen, Users } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_MISSION } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: "The story and mission behind Kingdom Athlete.",
};

const pillars = [
  {
    icon: Dumbbell,
    title: "Discipline",
    body: "Consistency in the small things — a workout, a meal, a quiet moment — builds a life that honors God.",
  },
  {
    icon: BookOpen,
    title: "Grace",
    body: "Progress over perfection. Barnabas encourages; it never shames. Missed a day? Start again tomorrow.",
  },
  {
    icon: Users,
    title: "Community",
    body: "Faith and fitness both grow best in company. We build for groups, churches, and accountability.",
  },
  {
    icon: HeartHandshake,
    title: "Stewardship",
    body: "Your body is a temple, not a project. We help you care for it as an act of worship, not vanity.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-8 pt-20 text-center">
          <Reveal>
            <Badge variant="gold">Our story</Badge>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Faith and fitness were never meant to compete
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-muted">
              Kingdom Athlete started with a simple frustration: every app made
              us choose between training our bodies and tending our souls. We
              built the one that refuses to choose.
            </p>
          </Reveal>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-10">
          <Reveal className="glass space-y-4 rounded-3xl border border-border p-8 text-sm leading-relaxed text-muted sm:p-10">
            <p>
              It started with a simple, familiar frustration: our calendars
              had a slot for the gym and a slot for devotions, and the two
              never talked to each other. Fitness apps were secular and
              transactional. Devotional apps never touched a barbell.
            </p>
            <p>
              So we started sketching a different kind of app — one daily
              rhythm where a workout plan, a reading plan, and a coach who
              actually knows your name (or at least your streak) all live in
              the same place.
            </p>
            <p>
              We&apos;re still early — a small, independent team building this
              one honest commit at a time. Our hope is that you&apos;ll train
              with discipline and rest with grace here — no guilt, no
              gimmicks, just steady faithfulness in body and spirit.
            </p>
          </Reveal>
        </section>

        {/* Mission */}
        <section id="mission" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="green">Our mission</Badge>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {APP_MISSION}
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p, i) => (
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

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 py-20">
          <Reveal className="glass ring-gold relative overflow-hidden rounded-3xl border border-gold/20 px-8 py-14 text-center sm:px-12">
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Want to build this with us?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              We&apos;re a small, independent team — but we&apos;re always glad to
              hear from people who care about both craft and calling.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/careers">
                <Button size="lg">Careers</Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="secondary">
                  Get in touch
                </Button>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
