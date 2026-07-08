import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { WorkoutSession } from "@/components/fitness/workout-session";
import { getProgramBySlug } from "@/lib/queries/programs";
import { getCurrentUser } from "@/lib/queries/profile";

function findDay(program: Awaited<ReturnType<typeof getProgramBySlug>>, dayId: string) {
  return program?.schedule.flatMap((w) => w.days).find((d) => d.id === dayId);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ programId: string; dayId: string }>;
}): Promise<Metadata> {
  const { programId, dayId } = await params;
  const program = await getProgramBySlug(programId);
  const day = findDay(program, dayId);
  return { title: day ? `${day.title} · ${program?.title}` : "Workout" };
}

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ programId: string; dayId: string }>;
}) {
  const { programId, dayId } = await params;
  const program = await getProgramBySlug(programId);
  if (!program) notFound();

  const user = await getCurrentUser();
  if (program.premium && !user.isPremium) redirect(`/fitness/${programId}`);

  const day = findDay(program, dayId);
  if (!day) notFound();

  return (
    <>
      <Topbar title={day.title} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <WorkoutSession programId={program.id} day={day} />
      </main>
    </>
  );
}
