"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FilmModal } from "@/components/marketing/film-modal";
import { ArrowRight, Play, Star } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";

// Above the fold: animate position only, never opacity, so the hero is
// readable in the server HTML before JS hydrates (no blank first paint).
const fadeUp = {
  hidden: { y: 24 },
  show: (i: number) => ({
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
  }),
};

export function Hero({ dict, freeMode = false }: { dict: Dictionary; freeMode?: boolean }) {
  // reducedMotion="user": no movement at all for prefers-reduced-motion.
  return (
    <MotionConfig reducedMotion="user">
      <HeroContent dict={dict} freeMode={freeMode} />
    </MotionConfig>
  );
}

function HeroContent({ dict, freeMode }: { dict: Dictionary; freeMode: boolean }) {
  const [filmOpen, setFilmOpen] = useState(false);

  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-20 sm:pt-28">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-4 py-1.5 text-sm text-accent-bright"
        >
          <Star className="size-3.5 fill-accent-bright" />
          {dict["mkt.hero.badge"]}
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          {dict["mkt.hero.title1"]}
          <br />
          <span className="text-gradient-accent">{dict["mkt.hero.title2"]}</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto mt-6 max-w-2xl text-lg text-muted"
        >
          {dict["mkt.hero.subtitle"]}
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href="/signup">
            <Button size="lg" className="group">
              {dict[freeMode ? "mkt.hero.ctaFree" : "mkt.hero.cta"]}
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Button size="lg" variant="secondary" onClick={() => setFilmOpen(true)}>
            <Play className="fill-current" />
            {dict["mkt.hero.watchFilm"]}
          </Button>
        </motion.div>

        <motion.p
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-5 text-sm text-faint"
        >
          {dict[freeMode ? "mkt.hero.footnoteFree" : "mkt.hero.footnote"]}
        </motion.p>
      </div>

      <HeroPreview dict={dict} />
      <FilmModal dict={dict} open={filmOpen} onClose={() => setFilmOpen(false)} />
    </section>
  );
}

function HeroPreview({ dict }: { dict: Dictionary }) {
  return (
    <motion.div
      initial={{ y: 60, scale: 0.96 }}
      animate={{ y: 0, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative mx-auto mt-16 max-w-4xl"
    >
      <div className="absolute -inset-x-10 -top-10 -z-10 h-40 rounded-full bg-accent/10 blur-3xl" />
      <div className="glass ring-accent overflow-hidden rounded-3xl border border-border p-2">
        <div className="rounded-2xl bg-surface p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <PreviewStat label={dict["mkt.preview.streak"]} value="26" accent />
            <PreviewStat label={dict["mkt.preview.workouts"]} value="148" />
            <PreviewStat label={dict["mkt.preview.verses"]} value="37" />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface-2 p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {dict["mkt.verseOfDay"]}
              </p>
              <p className="mt-2 font-serif text-lg leading-snug">
                {dict["mkt.verse.short"]}
              </p>
              <p className="mt-2 text-sm text-accent-bright">{dict["mkt.verse.shortRef"]}</p>
            </div>
            <div className="rounded-xl border border-border bg-gradient-to-br from-green-deep to-surface-2 p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {dict["mkt.todaysWorkout"]}
              </p>
              <p className="mt-2 font-serif text-lg">{dict["mkt.workout.name"]}</p>
              <p className="mt-1 text-sm text-muted">{dict["mkt.workout.meta"]}</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/30">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-ember-deep to-ember" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
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
        className={`font-serif text-3xl font-semibold ${accent ? "text-ember" : "text-foreground"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
