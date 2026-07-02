import type { Metadata } from "next";
import { BookOpen, Brain, HandHeart, CheckCircle2, Circle } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dailyDevotional } from "@/data/devotional";
import { readingPlans, memoryVerses, prayerRequests } from "@/data/spiritual";

export const metadata: Metadata = {
  title: "Spiritual",
  description: "Bible reading plans, devotionals, prayer journal, and verse memorization.",
};

export default function SpiritualPage() {
  const { verse, reflection, prayer } = dailyDevotional;

  return (
    <>
      <Topbar title="Spiritual" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <PageHeader
          title="Spiritual"
          subtitle="Train the soul with the same discipline as the body."
        />

        {/* Today's devotional */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-deep/50 to-surface">
          <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative">
            <Badge variant="gold">
              <BookOpen className="size-3" /> Today&apos;s devotional
            </Badge>
            <blockquote className="mt-4 max-w-3xl font-serif text-2xl leading-snug">
              “{verse.text}”
            </blockquote>
            <p className="mt-3 text-sm font-semibold text-gold-bright">
              {verse.reference} · {verse.translation}
            </p>
            <p className="mt-4 max-w-2xl text-muted">{reflection}</p>
            <div className="mt-5 rounded-xl border border-border bg-black/20 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                <HandHeart className="size-4" /> Prayer
              </p>
              <p className="mt-2 text-sm leading-relaxed">{prayer}</p>
            </div>
            <Button className="mt-5">Mark as complete</Button>
          </div>
        </Card>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {/* Reading plans */}
          <div className="space-y-5 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Reading plans</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {readingPlans.map((plan) => {
                  const done = plan.completedDays === plan.totalDays;
                  return (
                    <div
                      key={plan.id}
                      className="rounded-xl border border-border bg-surface-2 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-serif font-semibold leading-tight">
                            {plan.title}
                          </h3>
                          <p className="mt-0.5 text-sm text-muted">
                            {plan.description}
                          </p>
                        </div>
                        {done && (
                          <Badge variant="green">
                            <CheckCircle2 className="size-3" /> Done
                          </Badge>
                        )}
                      </div>
                      <div className="mt-3">
                        <Progress value={plan.completedDays / plan.totalDays} />
                        <p className="mt-1.5 text-xs text-muted">
                          {plan.completedDays}/{plan.totalDays} days
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Memory verses */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="inline-flex items-center gap-2">
                    <Brain className="size-4" /> Verse memorization
                  </span>
                </CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {memoryVerses.map((v) => (
                  <div
                    key={v.reference}
                    className="rounded-xl border border-border bg-surface-2 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gold-bright">
                        {v.reference}
                      </p>
                      <span className="text-xs text-muted">
                        {Math.round(v.mastery * 100)}% mastered
                      </span>
                    </div>
                    <p className="mt-1.5 font-serif text-sm italic text-foreground/90">
                      “{v.text}”
                    </p>
                    <Progress
                      value={v.mastery}
                      className="mt-3 h-1.5"
                      barClassName="from-green to-green-bright"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Prayer journal */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Prayer journal</CardTitle>
                <Button size="sm" variant="ghost">
                  + New
                </Button>
              </CardHeader>
              <div className="space-y-3">
                {prayerRequests.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-border bg-surface-2 p-4"
                  >
                    <div className="flex items-start gap-2">
                      {p.answered ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-bright" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-faint" />
                      )}
                      <div>
                        <h3 className="text-sm font-semibold leading-tight">
                          {p.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted">{p.body}</p>
                        {p.answered && (
                          <span className="mt-2 inline-block text-xs font-semibold text-green-bright">
                            Answered · Praise God
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
