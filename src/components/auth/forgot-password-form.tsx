"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestPasswordReset, type ForgotPasswordState } from "@/app/(auth)/actions";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function ForgotPasswordForm({ dict }: { dict: Dictionary }) {
  const [state, formAction] = useActionState<ForgotPasswordState, FormData>(
    requestPasswordReset,
    {},
  );

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        {dict["auth.forgotPasswordTitle"]}
      </h1>
      <p className="mt-2 text-sm text-muted">{dict["auth.forgotPasswordSubtitle"]}</p>

      {state.sent ? (
        <p className="mt-8 flex items-center gap-2 rounded-lg bg-green/10 px-3 py-2 text-sm text-green-bright">
          <CheckCircle2 className="size-4 shrink-0" />
          {dict["auth.resetLinkSent"]}
        </p>
      ) : (
        <form action={formAction} className="mt-8 space-y-3">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input
              name="email"
              type="email"
              placeholder={dict["auth.emailAddress"]}
              autoComplete="email"
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
      )}

      <p className="mt-6 text-center text-sm text-muted">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-semibold text-accent-bright hover:underline"
        >
          <ArrowLeft className="size-3.5" /> {dict["auth.backToLogin"]}
        </Link>
      </p>
    </div>
  );
}

function SubmitButton({ dict }: { dict: Dictionary }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="mt-2 w-full" disabled={pending}>
      {pending ? dict["common.loading"] : dict["auth.sendResetLink"]}
    </Button>
  );
}
