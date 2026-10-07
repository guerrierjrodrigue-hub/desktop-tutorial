"use client";

import { useState, useTransition } from "react";
import { Download, ShieldAlert, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteAccount } from "@/app/(app)/profile/privacy-actions";
import { DELETE_CONFIRMATION } from "@/lib/privacy";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function PrivacySection({ dict }: { dict: Dictionary }) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canDelete = typed.trim() === DELETE_CONFIRMATION;

  function runDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount(typed);
      // On success the action redirects, so reaching here means an error.
      if (result && !result.ok) {
        setError(
          result.error === "unavailable"
            ? dict["privacy.deleteUnavailable"]
            : dict["privacy.deleteError"],
        );
      }
    });
  }

  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>{dict["privacy.title"]}</CardTitle>
        <span className="text-xs text-muted">{dict["privacy.subtitle"]}</span>
      </CardHeader>

      <div className="space-y-4">
        {/* Export */}
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{dict["privacy.export"]}</p>
            <p className="text-xs text-muted">{dict["privacy.exportHint"]}</p>
          </div>
          <a href="/api/account/export" download>
            <Button variant="secondary" size="sm">
              <Download className="size-4" /> {dict["privacy.export"]}
            </Button>
          </a>
        </div>

        {/* Delete */}
        <div className="flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-danger">
                <ShieldAlert className="size-4" /> {dict["privacy.delete"]}
              </p>
              <p className="text-xs text-muted">{dict["privacy.deleteHint"]}</p>
            </div>
            {!confirming && (
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger/10"
                onClick={() => setConfirming(true)}
              >
                <Trash2 className="size-4" /> {dict["privacy.delete"]}
              </Button>
            )}
          </div>

          {confirming && (
            <div className="space-y-3 border-t border-danger/20 pt-3">
              <label className="block text-xs text-muted" htmlFor="delete-confirm">
                {dict["privacy.deleteConfirmPrompt"].replace("{word}", DELETE_CONFIRMATION)}
              </label>
              <input
                id="delete-confirm"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                autoFocus
                className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-danger/50 focus:ring-2 focus:ring-danger/20"
              />
              {error && <p className="text-xs text-danger">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConfirming(false);
                    setTyped("");
                    setError(null);
                  }}
                  disabled={pending}
                >
                  {dict["common.cancel"]}
                </Button>
                <Button
                  size="sm"
                  className="bg-danger text-white hover:bg-danger/90"
                  onClick={runDelete}
                  disabled={!canDelete || pending}
                >
                  {pending ? dict["privacy.deleting"] : dict["privacy.deleteConfirmButton"]}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
