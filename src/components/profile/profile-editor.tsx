"use client";

import { useState, useTransition } from "react";
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
  Compass,
  X,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { updateProfileAction } from "@/app/(app)/profile/actions";
import type { UserProfile } from "@/types";

interface ProfileEditorProps {
  user: UserProfile;
  level: number;
  progress: number;
  nextLevelXp: number;
  earnedBadges: number;
  onSignOut: () => Promise<void>;
  /** Hide the "Premium" badge during the free beta (everyone is unlocked). */
  freeMode?: boolean;
  /** Achievements card — rendered as the second column of the grid below. */
  children: React.ReactNode;
}

export function ProfileEditor({
  user: initialUser,
  level,
  progress,
  nextLevelXp,
  earnedBadges,
  onSignOut,
  freeMode = false,
  children,
}: ProfileEditorProps) {
  const [user, setUser] = useState(initialUser);
  const [draft, setDraft] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function startEdit() {
    setDraft(user);
    setError(null);
    setEditing(true);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateProfileAction({
        name: draft.name,
        bio: draft.bio ?? "",
        heightCm: draft.heightCm,
        weightKg: draft.weightKg,
        goal: draft.goal ?? "",
        church: draft.church ?? "",
        favoriteVerse: draft.favoriteVerse ?? "",
      });
      if (!result.ok) {
        setError(result.error ?? "Couldn't save your changes.");
        return;
      }
      setUser(draft);
      setEditing(false);
    });
  }

  const details = [
    { icon: Ruler, label: "Height", value: user.heightCm ? `${user.heightCm} cm` : "—" },
    { icon: Weight, label: "Weight", value: user.weightKg ? `${user.weightKg} kg` : "—" },
    { icon: Target, label: "Goal", value: user.goal ?? "—" },
    { icon: Church, label: "Church", value: user.church ?? "—" },
    { icon: BookMarked, label: "Favorite verse", value: user.favoriteVerse ?? "—" },
  ];

  return (
    <>
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-16 h-32 bg-gradient-to-b from-green/20 to-transparent" />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Avatar
            name={user.name}
            color="var(--color-green)"
            className="size-20 shrink-0 text-2xl"
          />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {editing ? (
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  aria-label="Name"
                  className="w-full max-w-xs rounded-lg border border-border bg-surface-2 px-3 py-1.5 font-serif text-lg font-semibold outline-none focus:border-gold/40"
                />
              ) : (
                <h2 className="font-serif text-2xl font-semibold">{user.name}</h2>
              )}
              {user.isPremium && !freeMode ? (
                <Badge variant="premium">
                  <Crown className="size-3" /> Premium
                </Badge>
              ) : (
                <Badge variant="neutral" className="capitalize">
                  {user.level}
                </Badge>
              )}
            </div>

            {editing ? (
              <textarea
                value={draft.bio ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                rows={2}
                placeholder="A short bio…"
                aria-label="Bio"
                className="mt-2 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-gold/40"
              />
            ) : (
              user.bio && <p className="mt-1 text-sm text-muted">{user.bio}</p>
            )}

            <div className="mt-4 flex justify-center gap-2 sm:justify-start">
              <Stat icon={Flame} label="Streak" value={user.streak} />
              <Stat icon={Zap} label="XP" value={user.xp.toLocaleString("en-US")} />
              <Stat icon={Trophy} label="Badges" value={earnedBadges} />
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            {editing ? (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label="Cancel"
                  onClick={() => setEditing(false)}
                  disabled={pending}
                >
                  <X className="size-5" />
                </Button>
                <Button size="icon" aria-label="Save profile" onClick={save} disabled={pending}>
                  <Check className="size-5" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/onboarding?edit=1">
                  <Button variant="secondary" size="icon" aria-label="Edit your identities">
                    <Compass className="size-5" />
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label="Edit profile"
                  onClick={startEdit}
                >
                  <Settings className="size-5" />
                </Button>
                <form action={onSignOut}>
                  <Button type="submit" variant="secondary" size="icon" aria-label="Sign out">
                    <LogOut className="size-5" />
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>

        {error && <p className="relative mt-3 text-sm text-danger">{error}</p>}

        <div className="relative mt-6">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-semibold text-gold-bright">Level {level}</span>
            <span className="text-muted">
              {(nextLevelXp - user.xp).toLocaleString("en-US")} XP to next
            </span>
          </div>
          <Progress value={progress} />
        </div>
      </Card>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          {editing ? (
            <div className="space-y-3">
              <EditField
                label="Height (cm)"
                type="number"
                value={draft.heightCm ?? ""}
                onChange={(v) => setDraft((d) => ({ ...d, heightCm: v ? Number(v) : undefined }))}
              />
              <EditField
                label="Weight (kg)"
                type="number"
                value={draft.weightKg ?? ""}
                onChange={(v) => setDraft((d) => ({ ...d, weightKg: v ? Number(v) : undefined }))}
              />
              <EditField
                label="Goal"
                value={draft.goal ?? ""}
                onChange={(v) => setDraft((d) => ({ ...d, goal: v }))}
              />
              <EditField
                label="Church"
                value={draft.church ?? ""}
                onChange={(v) => setDraft((d) => ({ ...d, church: v }))}
              />
              <EditField
                label="Favorite verse"
                value={draft.favoriteVerse ?? ""}
                onChange={(v) => setDraft((d) => ({ ...d, favoriteVerse: v }))}
              />
            </div>
          ) : (
            <dl className="space-y-3">
              {details.map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-gold/70">
                    <d.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs text-faint">{d.label}</dt>
                    <dd className="truncate text-sm font-medium">{d.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
        </Card>

        {children}
      </div>
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

function EditField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-faint">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-gold/40"
      />
    </label>
  );
}
