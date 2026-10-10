"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetPassword, type ResetPasswordState } from "@/app/(auth)/actions";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function ResetPasswordForm({ dict }: { dict: Dictionary }) {
  const [state, formAction] = useActionState<ResetPasswordState, FormData>(
    resetPassword,
    {},
  );

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        {dict["auth.resetPasswordTitle"]}
      </h1>
      <p className="mt-2 text-sm text-muted">{dict["auth.resetPasswordSubtitle"]}</p>

      <form action={formAction} className="mt-8 space-y-3">
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input
            name="password"
            type="password"
            placeholder={dict["auth.newPassword"]}
            autoComplete="new-password"
            minLength={6}
            required
            className="h-12 w-full rounded-xl border border-border bg-surface-2 pl-11 pr-4 text-sm outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input
            name="confirmPassword"
            type="password"
            placeholder={dict["auth.confirmPassword"]}
            autoComplete="new-password"
            minLength={6}
            required
            className="h-12 w-full rounded-xl border border-border bg-surface-2 pl-11 pr-4 text-sm outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {state.error && (
          <p className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            <AlertCircle className="size-4 shrink-0" />
            {state.error}
          </p>
        )}

        <SubmitButton dict={dict} />
      </form>
    </div>
  );
}

function SubmitButton({ dict }: { dict: Dictionary }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="mt-2 w-full" disabled={pending}>
      {pending ? dict["common.loading"] : dict["auth.updatePassword"]}
    </Button>
  );
}
