import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { CoachChat } from "@/components/coach/coach-chat";
import { COACHES, getCoach } from "@/data/coaches";

export function generateStaticParams() {
  return COACHES.map((c) => ({ coachId: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ coachId: string }>;
}): Promise<Metadata> {
  const { coachId } = await params;
  const coach = COACHES.find((c) => c.id === coachId);
  return {
    title: coach ? `${coach.name} — AI Coach` : "Coach",
    description: coach?.tagline,
  };
}

export default async function CoachChatPage({
  params,
}: {
  params: Promise<{ coachId: string }>;
}) {
  const { coachId } = await params;
  if (!COACHES.some((c) => c.id === coachId)) notFound();
  const coach = getCoach(coachId);

  return (
    <>
      <Topbar />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6">
        <Link
          href="/coach"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Choose a different coach
        </Link>
        <div className="mb-4 flex items-center gap-3">
          <span
            className={`grid size-11 place-items-center rounded-2xl bg-gradient-to-br ${coach.avatarGradient} text-background shadow-[0_6px_20px_-6px_rgba(250,17,79,0.6)]`}
          >
            <Sparkles className="size-5" />
          </span>
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight">{coach.name}</h1>
            <p className="text-sm text-muted">{coach.tagline}</p>
          </div>
        </div>
        <CoachChat key={coach.id} coach={coach} />
      </main>
    </>
  );
}
