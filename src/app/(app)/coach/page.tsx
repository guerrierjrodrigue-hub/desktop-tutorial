import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { COACHES } from "@/data/coaches";

export const metadata: Metadata = {
  title: "Coach",
  description: "Choose your AI coach — each with a distinct voice and focus.",
};

export default function CoachPickerPage() {
  return (
    <>
      <Topbar title="Coach" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
        <p className="mb-6 text-sm text-muted">
          Pick the coach that fits what you need today. You can switch anytime.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {COACHES.map((coach) => (
            <Link key={coach.id} href={`/coach/${coach.id}`}>
              <Card className="h-full transition hover:border-gold/30">
                <span
                  className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${coach.avatarGradient} text-background shadow-[0_6px_20px_-6px_rgba(250,17,79,0.6)]`}
                >
                  <Sparkles className="size-5" />
                </span>
                <h2 className="mt-4 font-serif text-xl font-semibold">{coach.name}</h2>
                <p className="mt-1 text-sm text-muted">{coach.tagline}</p>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
