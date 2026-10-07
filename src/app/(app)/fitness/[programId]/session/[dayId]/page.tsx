import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { WorkoutSession } from "@/components/fitness/workout-session";
import { getProgramBySlug } from "@/lib/queries/programs";
import { getCurrentUser } from "@/lib/queries/profile";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

function findDay(program: Awaited<ReturnType<typeof getProgramBySlug>>, dayId: string) {
  return program?.schedule.flatMap((w) => w.days).find((d) => d.id === dayId);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ programId: string; dayId: string }>;
}): Promise<Metadata> {
  const { programId, dayId } = await params;
  const program = await getProgramBySlug(programId, await getLocale());
  const day = findDay(program, dayId);
  if (day) return { title: `${day.title} · ${program?.title}` };
  const dict = await getDictionary(await getLocale());
  return { title: dict["fitness.workoutFallback"] };
}

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ programId: string; dayId: string }>;
}) {
  const { programId, dayId } = await params;
  const locale = await getLocale();
  const program = await getProgramBySlug(programId, locale);
  if (!program) notFound();

  const user = await getCurrentUser();
  if (program.premium && !user.isPremium) redirect(`/fitness/${programId}`);

  const day = findDay(program, dayId);
  if (!day) notFound();

  const dict = await getDictionary(locale);

  return (
    <>
      <Topbar title={day.title} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <WorkoutSession programId={program.id} day={day} dict={dict} />
      </main>
    </>
  );
}
