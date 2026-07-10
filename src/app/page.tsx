import Link from "next/link";
import {
  Dumbbell,
  Apple,
  BookOpen,
  Sparkles,
  Trophy,
  Users,
  Check,
  Quote,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Hero } from "@/components/marketing/hero";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { plans } from "@/data/pricing";

const features = [
  {
    icon: Dumbbell,
    title: "Guided Programs",
    body: "Strength, HIIT, running, mobility & bodyweight plans for every level — with video, sets, reps, and rest built in.",
  },
  {
    icon: Apple,
    title: "Smart Nutrition",
    body: "Calorie & macro tracking, hydration, curated Christian-friendly recipes, and an effortless food journal.",
  },
  {
    icon: BookOpen,
    title: "Scripture & Prayer",
    body: "An integrated Bible, daily reading plans, devotionals, a prayer journal, and verse memorization.",
  },
  {
    icon: Sparkles,
    title: "Barnabas AI Coach",
    body: "A wise, encouraging coach that adapts your workouts, answers questions, and prays with you.",
  },
  {
    icon: Trophy,
    title: "Gamified Growth",
    body: "XP, levels, badges, streaks and challenges — including church-vs-church and friend competitions.",
  },
  {
    icon: Users,
    title: "Community",
    body: "Groups, testimonies, progress shares, and prayer requests. Iron sharpens iron.",
  },
];

const pillars = [
  { value: "6", label: "Guided programs" },
  { value: "109", label: "Recipes across 5 goals" },
  { value: "4", label: "Bible reading plans" },
  { value: "4", label: "AI coach personas" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <Hero />

        {/* Social proof */}
        <section className="border-y border-border bg-surface/30 py-10">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 sm:grid-cols-4">
            {pillars.map((p) => (
              <div key={p.label} className="text-center">
                <p className="font-serif text-3xl font-semibold text-gradient-gold">
                  {p.value}
                </p>
                <p className="mt-1 text-sm text-muted">{p.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="gold">Everything in one place</Badge>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              One daily rhythm for body and soul
            </h2>
            <p className="mt-4 text-muted">
              Most apps train the body. Kingdom Athlete disciples the whole
              person — strength, nutrition, and spirit — in a single, beautiful
              flow.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <div className="glass group h-full rounded-2xl border border-border p-6 transition hover:border-gold/30">
                  <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-gold/15 to-transparent text-gold-bright ring-1 ring-gold/20">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-semibold">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {f.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Barnabas */}
        <section id="barnabas" className="mx-auto max-w-6xl px-6 py-16">
          <div className="glass overflow-hidden rounded-3xl border border-border">
            <div className="grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2">
              <Reveal>
                <Badge variant="premium">Meet Barnabas</Badge>
                <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  Your AI coach for faith &amp; fitness
                </h2>
                <p className="mt-4 text-muted">
                  Named after the “son of encouragement,” Barnabas motivates
                  without shame, adapts your training to how you feel, offers
                  nutrition wisdom, and meets you with a prayer when the day is
                  heavy. Always biblically grounded. Never preachy.
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  {[
                    "Adapts workouts to your energy and injuries",
                    "Answers fitness, nutrition & faith questions",
                    "Suggests prayers, devotions & meditations",
                    "Encourages with love, wisdom, and humility",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-green-bright" />
                      <span className="text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <ChatBubble role="assistant">
                    Good morning, David. You&apos;re on a 26-day streak — that&apos;s
                    real discipline. 🙌 How&apos;s your energy today?
                  </ChatBubble>
                  <ChatBubble role="user">
                    Honestly pretty tired, didn&apos;t sleep well.
                  </ChatBubble>
                  <ChatBubble role="assistant">
                    Then let&apos;s honor your body with recovery. I&apos;ll swap
                    today for a 20-min mobility flow and breath prayer from Psalm
                    23. Rest is faithful too. Want me to start it?
                  </ChatBubble>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Conviction */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <Reveal>
            <Quote className="mx-auto size-8 text-gold/50" />
            <p className="mt-6 font-serif text-2xl font-medium leading-snug sm:text-3xl">
              “Do you not know that your bodies are temples of the Holy
              Spirit? Therefore honor God with your bodies.”
            </p>
            <p className="mt-6 text-sm text-muted">1 Corinthians 6:19–20</p>
          </Reveal>
        </section>

        <Pricing />

        {/* Final CTA */}
        <section className="mx-auto max-w-5xl px-6 py-20">
          <Reveal className="glass ring-gold relative overflow-hidden rounded-3xl border border-gold/20 px-8 py-14 text-center sm:px-12">
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Your body is a temple.{" "}
              <span className="text-gradient-gold">Train it like one.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Start today with a 7-day free trial. Discipline of body, steadiness
              of soul.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/signup">
                <Button size="lg">Begin your journey</Button>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function ChatBubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? "bg-surface-2 text-foreground"
            : "bg-gradient-to-br from-green-deep to-green/40 text-foreground"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Badge variant="gold">Simple pricing</Badge>
        <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Invest in discipline that lasts
        </h2>
        <p className="mt-4 text-muted">
          Start free. Upgrade when you&apos;re ready. Cancel anytime.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {plans.map((plan, i) => (
          <Reveal key={plan.name} delay={i * 0.06}>
            <div
              className={`relative flex h-full flex-col rounded-2xl border p-7 ${
                plan.highlighted
                  ? "border-gold/40 bg-gradient-to-b from-gold/8 to-transparent ring-gold"
                  : "glass border-border"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="premium">Most popular</Badge>
                </span>
              )}
              <h3 className="font-serif text-xl font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted">{plan.description}</p>
              <p className="mt-5 flex items-baseline gap-1">
                <span className="font-serif text-4xl font-semibold">
                  {plan.price}
                </span>
                <span className="text-muted">{plan.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-gold-bright" />
                    <span className="text-muted">{f}</span>
                  </li>
                ))}
              </ul>
              <CheckoutButton
                plan={plan.plan}
                label={plan.cta}
                className="mt-7 w-full"
                variant={plan.highlighted ? "primary" : "secondary"}
              />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
