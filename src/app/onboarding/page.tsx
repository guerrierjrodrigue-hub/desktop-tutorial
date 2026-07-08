import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getCurrentUser } from "@/lib/queries/profile";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Tell us your goal and who you want to become.",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const user = edit ? await getCurrentUser() : null;

  return (
    <div className="bg-ambient flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <OnboardingWizard
        initialGoal={user?.primaryGoal}
        initialIdentities={user?.identities}
      />
    </div>
  );
}
