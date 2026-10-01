"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilmModal } from "@/components/marketing/film-modal";
import { ArrowRight, Play, Star } from "lucide-react";

// The hero is above the fold, so it renders statically and is fully visible on
// first paint — no opacity:0 entrance that would flash black before hydration.

export function Hero() {
  const [filmOpen, setFilmOpen] = useState(false);

  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-20 sm:pt-28">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/8 px-4 py-1.5 text-sm text-gold-bright">
          <Star className="size-3.5 fill-gold-bright" />
          Faith-driven fitness, reimagined
        </div>

        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Strengthen your body.
          <br />
          <span className="text-gradient-gold">Grow your faith.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Kingdom Athlete unites guided training, nutrition, Scripture, and
          prayer into one daily rhythm — with Barnabas, your AI faith &amp;
          fitness coach, by your side.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="group">
              Start your 1 month free trial
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Button size="lg" variant="secondary" onClick={() => setFilmOpen(true)}>
            <Play className="fill-current" />
            Watch the film
          </Button>
        </div>

        <p className="mt-5 text-sm text-faint">
          Train with purpose · 1 month free · No card required
        </p>
      </div>

      <HeroPreview />
      <FilmModal open={filmOpen} onClose={() => setFilmOpen(false)} />
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-4xl">
      <div className="absolute -inset-x-10 -top-10 -z-10 h-40 rounded-full bg-gold/10 blur-3xl" />
      <div className="glass ring-gold overflow-hidden rounded-3xl border border-border p-2">
        <div className="rounded-2xl bg-surface p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <PreviewStat label="Day streak" value="26" accent />
            <PreviewStat label="Workouts" value="148" />
            <PreviewStat label="Verses memorized" value="37" />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface-2 p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Verse of the day
              </p>
              <p className="mt-2 font-serif text-lg leading-snug">
                “Do you not know that your bodies are temples of the Holy
                Spirit?”
              </p>
              <p className="mt-2 text-sm text-gold-bright">1 Corinthians 6:19</p>
            </div>
            <div className="rounded-xl border border-border bg-gradient-to-br from-green-deep to-surface-2 p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Today&apos;s workout
              </p>
              <p className="mt-2 font-serif text-lg">Lower Body Power</p>
              <p className="mt-1 text-sm text-muted">4 exercises · 45 min</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/30">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-gold to-gold-bright" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-5 text-left">
      <p
        className={`font-serif text-3xl font-semibold ${accent ? "text-gold-bright" : "text-foreground"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
