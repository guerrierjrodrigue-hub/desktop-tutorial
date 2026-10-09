"use client";

import { useState, useTransition } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { joinChallenge } from "@/app/(app)/challenges/actions";

/** Joins a recommended challenge from the dashboard card. */
export function JoinChallengeButton({ challengeId, label }: { challengeId: string; label: string }) {
  const [pending, startTransition] = useTransition();
  const [joined, setJoined] = useState(false);

  function join() {
    startTransition(async () => {
      await joinChallenge(challengeId);
      setJoined(true);
    });
  }

  return (
    <Button size="sm" onClick={join} disabled={pending || joined} className="w-full">
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : joined ? (
        <Check className="size-4" />
      ) : null}
      {label}
    </Button>
  );
}
