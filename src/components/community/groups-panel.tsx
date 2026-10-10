"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { joinGroup } from "@/app/(app)/community/actions";
import { plural } from "@/lib/i18n-plural";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { LocaleCode } from "@/i18n/locales";
import type { CommunityGroup } from "@/lib/queries/community";

function GroupRow({
  group,
  dict,
  locale,
  onJoin,
  joining,
}: {
  group: CommunityGroup;
  dict: Dictionary;
  locale: LocaleCode;
  onJoin?: (id: string) => void;
  joining?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
      <span className="grid size-10 place-items-center rounded-lg bg-elevated text-lg">
        {group.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{group.name}</p>
        <p className="text-xs text-faint">
          {plural(
            group.members,
            { one: dict["plural.members.one"], other: dict["plural.members.other"] },
            locale,
          )}
        </p>
      </div>
      {onJoin && (
        <Button size="sm" variant="secondary" onClick={() => onJoin(group.id)} disabled={joining}>
          {dict["community.join"]}
        </Button>
      )}
    </div>
  );
}

export function GroupsPanel({
  initial,
  dict,
  locale,
}: {
  initial: CommunityGroup[];
  dict: Dictionary;
  locale: LocaleCode;
}) {
  const [groups, setGroups] = useState(initial);
  const [pending, startTransition] = useTransition();

  const joined = groups.filter((g) => g.joined);
  const discover = groups.filter((g) => !g.joined);

  function join(id: string) {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, joined: true, members: g.members + 1 } : g)),
    );
    startTransition(async () => {
      await joinGroup(id);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict["community.yourGroups"]}</CardTitle>
      </CardHeader>
      <div className="space-y-2">
        {joined.length === 0 ? (
          <p className="text-sm text-muted">{dict["community.noGroupsYet"]}</p>
        ) : (
          joined.map((g) => <GroupRow key={g.id} group={g} dict={dict} locale={locale} />)
        )}
      </div>

      {discover.length > 0 && (
        <>
          <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-faint">
            {dict["community.discoverGroups"]}
          </h3>
          <div className="mt-2 space-y-2">
            {discover.map((g) => (
              <GroupRow key={g.id} group={g} dict={dict} locale={locale} onJoin={join} joining={pending} />
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
