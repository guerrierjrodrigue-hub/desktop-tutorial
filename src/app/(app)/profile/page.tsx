import type { Metadata } from "next";
import Link from "next/link";
import { Crown } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/queries/profile";
import { getBadges } from "@/lib/queries/badges";
import { Icon } from "@/components/ui/icon";
import { levelFromXp } from "@/lib/utils";
import { signOutAction } from "@/app/(auth)/actions";
import { ManageBillingButton } from "@/components/billing/manage-billing-button";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { LanguageSwitcher } from "@/components/settings/language-switcher";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const [currentUser, badges, locale] = await Promise.all([
    getCurrentUser(),
    getBadges(),
    getLocale(),
  ]);
  const dict = await getDictionary(locale);
  const { level, progress, nextLevelXp } = levelFromXp(currentUser.xp);
  const earned = badges.filter((b) => b.earned);

  return (
    <>
      <Topbar title="Profile" />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        <ProfileEditor
          user={currentUser}
          level={level}
          progress={progress}
          nextLevelXp={nextLevelXp}
          earnedBadges={earned.length}
          onSignOut={signOutAction}
        >
          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>{dict["dashboard.achievements"]}</CardTitle>
              <span className="text-xs text-muted">
                {earned.length}/{badges.length}
              </span>
            </CardHeader>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  title={badge.description}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center ${
                    badge.earned
                      ? "border-gold/25 bg-gold/8"
                      : "border-border bg-surface-2 opacity-50"
                  }`}
                >
                  <span
                    className={`grid size-10 place-items-center rounded-full ${
                      badge.earned
                        ? "bg-gradient-to-br from-gold-bright to-gold-deep text-background"
                        : "bg-elevated text-faint"
                    }`}
                  >
                    <Icon name={badge.icon} className="size-5" />
                  </span>
                  <span className="text-[11px] font-medium leading-tight">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </ProfileEditor>

        <div className="mt-5">
          <LanguageSwitcher currentLocale={locale} dict={dict} />
        </div>

        {currentUser.isPremium ? (
          <Card className="mt-5 flex flex-col items-center justify-between gap-4 bg-gradient-to-br from-gold/12 to-surface sm:flex-row">
            <div className="text-center sm:text-left">
              <h3 className="font-serif text-lg font-semibold">
                You&apos;re a Premium member
              </h3>
              <p className="text-sm text-muted">
                Thank you for investing in your discipline. Manage or update your
                plan anytime.
              </p>
            </div>
            <ManageBillingButton />
          </Card>
        ) : (
          <Card className="mt-5 flex flex-col items-center justify-between gap-4 bg-gradient-to-br from-gold/12 to-surface sm:flex-row">
            <div className="text-center sm:text-left">
              <h3 className="font-serif text-lg font-semibold">
                Unlock your full potential
              </h3>
              <p className="text-sm text-muted">
                Go Premium for every program, unlimited Barnabas, and advanced
                insights.
              </p>
            </div>
            <Link href="/pricing">
              <Button>
                <Crown className="size-4" /> Go Premium
              </Button>
            </Link>
          </Card>
        )}
      </main>
    </>
  );
}
