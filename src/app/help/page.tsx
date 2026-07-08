import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { APP_SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Answers to common questions about Kingdom Athlete.",
};

const categories = [
  {
    title: "Getting started",
    faqs: [
      {
        q: "How do I choose my first program?",
        a: "Head to Fitness in the app and filter by level and category. Not sure? Barnabas can recommend one based on your goal and schedule in a single chat message.",
      },
      {
        q: "Do I need any equipment?",
        a: "No. Several programs (like our bodyweight and mobility plans) need zero equipment. Others use a barbell or dumbbells — each program lists what you'll need before you start.",
      },
    ],
  },
  {
    title: "Billing & subscription",
    faqs: [
      {
        q: "How do I cancel my subscription?",
        a: "Go to Profile → Manage billing. You'll keep access until the end of your current billing period — no calls, no retention flow.",
      },
      {
        q: "Can I switch between monthly and annual plans?",
        a: "Yes, anytime from the billing portal. Switching to annual applies a prorated credit for time remaining on your current plan.",
      },
    ],
  },
  {
    title: "Barnabas AI coach",
    faqs: [
      {
        q: "Is Barnabas a real person?",
        a: "No — Barnabas is an AI coach built to encourage you, adapt workouts, and answer fitness, nutrition, and faith questions with a consistent, biblically grounded voice.",
      },
      {
        q: "Can Barnabas replace medical or pastoral advice?",
        a: "No. Barnabas is a supportive coach, not a substitute for a doctor, therapist, or pastor. For medical concerns, always consult a qualified professional.",
      },
    ],
  },
  {
    title: "Account & privacy",
    faqs: [
      {
        q: "How do I update my profile details?",
        a: "Go to Profile and tap the settings icon next to your name — you can edit your name, bio, stats, and more from there.",
      },
      {
        q: "How is my data handled?",
        a: "See our Privacy Policy for the full details on what we collect and how it's used.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-8 pt-20 text-center">
          <Reveal>
            <Badge variant="gold">Help Center</Badge>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              How can we help?
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-muted">
              Answers to the questions we hear most. Can&apos;t find yours?{" "}
              <Link href="/contact" className="text-gold-bright hover:underline">
                Reach out directly
              </Link>
              .
            </p>
          </Reveal>
        </section>

        <section className="mx-auto max-w-3xl space-y-10 px-6 pb-24">
          {categories.map((cat, ci) => (
            <Reveal key={cat.title} delay={ci * 0.05}>
              <h2 className="mb-4 font-serif text-xl font-semibold">{cat.title}</h2>
              <div className="space-y-3">
                {cat.faqs.map((f) => (
                  <div key={f.q} className="glass rounded-2xl border border-border p-5">
                    <h3 className="font-semibold">{f.q}</h3>
                    <p className="mt-2 text-sm text-muted">{f.a}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}

          <Reveal className="glass rounded-2xl border border-border p-6 text-center">
            <p className="text-sm text-muted">
              Still stuck? Email{" "}
              <a href={`mailto:${APP_SUPPORT_EMAIL}`} className="text-gold-bright hover:underline">
                {APP_SUPPORT_EMAIL}
              </a>{" "}
              and we&apos;ll help you sort it out.
            </p>
          </Reveal>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
