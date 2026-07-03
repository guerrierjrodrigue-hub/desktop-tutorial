import type { Metadata } from "next";
import Link from "next/link";
import {
  Flame,
  Zap,
  Trophy,
  Ruler,
  Weight,
  Target,
  Church,
  BookMarked,
  Settings,
  Crown,
  LogOut,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser } from "@/lib/queries/profile";
import { badges } from "@/data/dashboard";
import { Icon } from "@/components/ui/icon";
import { levelFromXp } from "@/lib/utils";
import { signOutAction } from "@/app/(auth)/actions";
import { ManageBillingButton } from "@/components/billing/manage-billing-button";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();
  const { level, progress, nextLevelXp } = levelFromXp(currentUser.xp);
  const earned = badges.filter((b) => b.earned);

  const details = [
    { icon: Ruler, label: "Height", value: currentUser.heightCm ? `${currentUser.heightCm} cm` : "—" },
    { icon: Weight, label: "Weight", value: currentUser.weightKg ? `${currentUser.weightKg} kg` : "—" },
    { icon: Target, label: "Goal", value: currentUser.goal ?? "—" },
    { icon: Church, label: "Church", value: currentUser.church ?? "—" },
    { icon: BookMarked, label: "Favorite verse", value: currentUser.favoriteVerse ?? "—" },
  ];

  return (
    <>
      <Topbar title="Profile" />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        {/* Header card */}
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 -top-16 h-32 bg-gradient-to-b from-green/20 to-transparent" />
          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar
              name={currentUser.name}
              color="var(--color-green)"
              className="size-20 text-2xl"
            />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className="font-serif text-2xl font-semibold">
                  {currentUser.name}
                </h2>
                {currentUser.isPremium ? (
                  <Badge variant="premium">
                    <Crown className="size-3" /> Premium
                  </Badge>
                ) : (
                  <Badge variant="neutral" className="capitalize">
                    {currentUser.level}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">{currentUser.bio}</p>

              <div className="mt-4 flex justify-center gap-2 sm:justify-start">
                <Stat icon={Flame} label="Streak" value={currentUser.streak} />
                <Stat icon={Zap} label="XP" value={currentUser.xp.toLocaleString()} />
                <Stat icon={Trophy} label="Badges" value={earned.length} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" aria-label="Settings">
                <Settings className="size-5" />
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="secondary" size="icon" aria-label="Sign out">
                  <LogOut className="size-5" />
                </Button>
              </form>
            </div>
          </div>

          <div className="relative mt-6">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-semibold text-gold-bright">Level {level}</span>
              <span className="text-muted">
                {(nextLevelXp - currentUser.xp).toLocaleString()} XP to next
              </span>
            </div>
            <Progress value={progress} />
          </div>
        </Card>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <dl className="space-y-3">
              {details.map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-surface-2 text-gold/70">
                    <d.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs text-faint">{d.label}</dt>
                    <dd className="truncate text-sm font-medium">{d.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
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

function Stat({
  icon: IconEl,
  label,
  value,
}: {
  icon: typeof Flame;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-4 py-2 text-center">
      <IconEl className="mx-auto size-4 text-gold/70" />
      <p className="mt-1 text-sm font-semibold">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-faint">{label}</p>
    </div>
  );
}
