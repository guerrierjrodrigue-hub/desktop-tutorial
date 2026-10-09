import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getCurrentUser } from "@/lib/queries/profile";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["meta.welcome"],
    description: "Tell us your goal and who you want to become.",
  };
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const [user, locale] = await Promise.all([
    edit ? getCurrentUser() : Promise.resolve(null),
    getLocale(),
  ]);
  const dict = await getDictionary(locale);

  return (
    <div className="bg-ambient flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <OnboardingWizard
        locale={locale}
        dict={dict}
        initialGoals={user?.primaryGoals}
        initialIdentities={user?.identities}
      />
    </div>
  );
}
