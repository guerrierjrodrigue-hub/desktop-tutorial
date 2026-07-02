import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { BarnabasChat } from "@/components/coach/barnabas-chat";

export const metadata: Metadata = {
  title: "Barnabas — AI Coach",
  description: "Your AI faith & fitness coach. Encouragement, workouts, nutrition, and prayer.",
};

export default function CoachPage() {
  return (
    <>
      <Topbar />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-gold-bright to-gold-deep text-background shadow-[0_6px_20px_-6px_rgba(212,175,55,0.6)]">
            <Sparkles className="size-5" />
          </span>
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight">
              Barnabas
            </h1>
            <p className="text-sm text-muted">
              Your faith &amp; fitness coach · son of encouragement
            </p>
          </div>
        </div>
        <BarnabasChat />
      </main>
    </>
  );
}
