"use client";

import { useState, useTransition } from "react";
import { Users, Church, UserRound, Flame, Plus, Share2, Check, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createChallenge, joinChallenge, leaveChallenge } from "@/app/(app)/challenges/actions";
import { cohortStartLabel } from "@/lib/cohort";
import { plural } from "@/lib/i18n-plural";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { LocaleCode } from "@/i18n/locales";
import type { Challenge } from "@/types";

const typeMeta: Record<Challenge["type"], { icon: typeof Users; labelKey: keyof Dictionary }> = {
  personal: { icon: UserRound, labelKey: "challenges.personal" },
  friends: { icon: Users, labelKey: "challenges.friends" },
  church: { icon: Church, labelKey: "challenges.church" },
};

const DURATION_OPTIONS = [7, 14, 21, 30, 40];

export function ChallengesList({
  initial,
  dict,
  locale,
  currentUserId,
}: {
  initial: Challenge[];
  dict: Dictionary;
  locale: LocaleCode;
  currentUserId?: string;
}) {
  const [challenges, setChallenges] = useState(initial);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Challenge["type"]>("personal");
  const [days, setDays] = useState(14);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmingLeaveId, setConfirmingLeaveId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function invite(c: Challenge) {
    if (!c.inviteCode) return;
    const ref = currentUserId ? `?ref=${currentUserId}` : "";
    const link = `${window.location.origin}/join/${c.inviteCode}${ref}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: c.title, url: link });
        return;
      }
    } catch {
      // fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(c.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      window.prompt(link, link);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const optimistic: Challenge = {
      id: crypto.randomUUID(),
      title: trimmed,
      description: description.trim(),
      type,
      participants: 1,
      durationDays: days,
      daysLeft: days,
      started: true,
      joined: true,
      progress: 0,
    };
    setChallenges((prev) => [optimistic, ...prev]);
    setTitle("");
    setDescription("");
    setComposing(false);
    startTransition(async () => {
      await createChallenge({ title: trimmed, description: description.trim(), type, endsInDays: days });
    });
  }

  function join(id: string) {
    // The window starts now, so a freshly joined challenge shows its full duration.
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              joined: true,
              participants: c.participants + 1,
              // A cohort keeps its shared countdown; a personal window starts now.
              daysLeft: c.startDate ? c.daysLeft : c.durationDays,
            }
          : c,
      ),
    );
    startTransition(async () => {
      await joinChallenge(id);
    });
  }

  function leave(id: string) {
    // Drop the user from the challenge and its participant count; the server
    // removes the row (and the leaderboard entry) on the next load.
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, joined: false, progress: 0, participants: Math.max(0, c.participants - 1) }
          : c,
      ),
    );
    setConfirmingLeaveId(null);
    startTransition(async () => {
      await leaveChallenge(id);
    });
  }

  return (
    <div className="space-y-4">
      {challenges.length === 0 && (
        <Card>
          <p className="text-sm text-muted">{dict["empty.noChallengesAvailable"]}</p>
        </Card>
      )}

      {challenges.map((c) => {
        const meta = typeMeta[c.type];
        // Cohorts carry a real `started` flag; anything else (personal, demo,
        // optimistic) is always "started".
        const isCohort = Boolean(c.startDate);
        const started = isCohort ? Boolean(c.started) : true;
        return (
          <Card key={c.id} data-testid={`challenge-${c.id}`}>
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-green/20 text-green-bright">
                <meta.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-semibold leading-tight">{c.title}</h3>
                  <Badge variant="neutral">{dict[meta.labelKey]}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">{c.description}</p>
                {isCohort && !started && c.startDate && (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-gold-bright">
                    <CalendarClock className="size-3.5" />
                    {dict["challenges.startsOn"].replace(
                      "{date}",
                      cohortStartLabel(c.startDate, locale),
                    )}
                  </p>
                )}
              </div>
              {c.joined ? (
                confirmingLeaveId === c.id ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmingLeaveId(null)}
                      disabled={pending}
                    >
                      {dict["common.cancel"]}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => leave(c.id)}
                      disabled={pending}
                    >
                      {dict["challenges.leaveConfirm"]}
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setConfirmingLeaveId(c.id)}
                    disabled={pending}
                  >
                    {dict["challenges.leave"]}
                  </Button>
                )
              ) : (
                <Button size="sm" onClick={() => join(c.id)} disabled={pending}>
                  {dict["challenges.join"]}
                </Button>
              )}
            </div>

            {c.inviteCode && (
              <button
                type="button"
                onClick={() => invite(c)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted transition hover:border-gold/30 hover:text-foreground"
              >
                {copiedId === c.id ? (
                  <>
                    <Check className="size-3.5 text-green-bright" /> {dict["challenges.inviteCopied"]}
                  </>
                ) : (
                  <>
                    <Share2 className="size-3.5" /> {dict["challenges.invite"]}
                  </>
                )}
              </button>
            )}

            <div className="mt-4">
              {c.joined && <Progress value={c.progress} />}
              <div
                className={cn(
                  "flex items-center justify-between text-xs text-muted",
                  c.joined && "mt-2",
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  {plural(
                    c.participants,
                    { one: dict["plural.participants.one"], other: dict["plural.participants.other"] },
                    locale,
                  )}
                </span>
                <span className="flex items-center gap-1.5">
                  <Flame className="size-3.5 text-gold/70" />
                  {started && (c.joined || isCohort)
                    ? plural(
                        c.daysLeft,
                        { one: dict["plural.daysLeft.one"], other: dict["plural.daysLeft.other"] },
                        locale,
                      )
                    : `${dict["challenges.lasts"]} ${c.durationDays} ${dict["challenges.daysUnit"]}`}
                </span>
              </div>
            </div>
          </Card>
        );
      })}

      {composing ? (
        <Card>
          <form onSubmit={submit} className="space-y-3">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={dict["challenges.titlePlaceholder"]}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/20"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={dict["challenges.descriptionPlaceholder"]}
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/20"
            />
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(typeMeta) as Challenge["type"][]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  aria-pressed={type === value}
                >
                  <Badge variant={type === value ? "gold" : "neutral"} className="cursor-pointer px-3 py-1.5">
                    {dict[typeMeta[value].labelKey]}
                  </Badge>
                </button>
              ))}
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="h-8 rounded-lg border border-border bg-surface-2 px-2 text-xs outline-none focus:border-gold/40"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} {dict["challenges.daysUnit"]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setComposing(false)}>
                {dict["common.cancel"]}
              </Button>
              <Button type="submit" size="sm" disabled={!title.trim() || pending}>
                {dict["challenges.create"]}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card
          className={cn(
            "flex items-center justify-between bg-gradient-to-br from-gold/10 to-surface",
          )}
        >
          <div>
            <h3 className="font-serif text-lg font-semibold">{dict["challenges.startOwn"]}</h3>
            <p className="text-sm text-muted">{dict["challenges.startOwnSubtitle"]}</p>
          </div>
          <Button onClick={() => setComposing(true)}>
            <Plus className="size-4" /> {dict["challenges.create"]}
          </Button>
        </Card>
      )}
    </div>
  );
}
