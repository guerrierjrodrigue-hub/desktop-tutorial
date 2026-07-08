"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  emailAuthAction,
  oauthAction,
  type AuthState,
} from "@/app/(auth)/actions";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function AuthForm({ mode, dict }: { mode: "login" | "signup"; dict: Dictionary }) {
  const isSignup = mode === "signup";
  const [state, formAction] = useActionState<AuthState, FormData>(
    emailAuthAction,
    {},
  );

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        {isSignup ? dict["auth.createAccount"] : dict["auth.welcomeBack"]}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {isSignup ? dict["auth.beginJourney"] : dict["auth.continueJourney"]}
      </p>

      {/* OAuth */}
      <div className="mt-8 space-y-3">
        <OAuthButton provider="google" label={dict["auth.continueWithGoogle"]} />
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-border" />
        {dict["auth.orWithEmail"]}
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="mode" value={mode} />
        {isSignup && (
          <Field icon={User} name="name" type="text" placeholder={dict["auth.fullName"]} autoComplete="name" />
        )}
        <Field
          icon={Mail}
          name="email"
          type="email"
          placeholder={dict["auth.emailAddress"]}
          autoComplete="email"
          required
        />
        <Field
          icon={Lock}
          name="password"
          type="password"
          placeholder={dict["auth.password"]}
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={6}
          required
        />

        {!isSignup && (
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-gold-bright hover:underline">
              {dict["auth.forgotPassword"]}
            </Link>
          </div>
        )}

        {state.error && (
          <p className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            <AlertCircle className="size-4 shrink-0" />
            {state.error}
          </p>
        )}

        <SubmitButton isSignup={isSignup} dict={dict} />
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isSignup ? dict["auth.alreadyHaveAccount"] : dict["auth.newHere"]}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-semibold text-gold-bright hover:underline"
        >
          {isSignup ? dict["auth.signIn"] : dict["auth.createOne"]}
        </Link>
      </p>
    </div>
  );
}

function SubmitButton({ isSignup, dict }: { isSignup: boolean; dict: Dictionary }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="mt-2 w-full group" disabled={pending}>
      {pending ? dict["common.loading"] : isSignup ? dict["auth.signUp"] : dict["auth.signIn"]}
      {!pending && (
        <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
      )}
    </Button>
  );
}

function Field({
  icon: Icon,
  ...props
}: { icon: typeof Mail } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint" />
      <input
        {...props}
        className="h-12 w-full rounded-xl border border-border bg-surface-2 pl-11 pr-4 text-sm outline-none transition focus:border-gold/40 focus:ring-2 focus:ring-gold/20"
      />
    </div>
  );
}

function OAuthButton({
  provider,
  label,
}: {
  provider: "google" | "apple";
  label: string;
}) {
  return (
    <form action={oauthAction}>
      <input type="hidden" name="provider" value={provider} />
      <button
        type="submit"
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface-2 text-sm font-medium transition hover:bg-elevated"
      >
        {provider === "google" ? <GoogleGlyph /> : <AppleGlyph />}
        {label}
      </button>
    </form>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.29 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-foreground" aria-hidden="true">
      <path d="M16.36 12.7c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.75 2.28-1.6 2.78-.41 6.89 1.15 9.15.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.39 0 1.78.74 3 .72 1.24-.02 2.02-1.12 2.78-2.23.88-1.28 1.24-2.52 1.26-2.58-.03-.01-2.42-.93-2.44-3.68ZM14.1 5.9c.64-.78 1.07-1.86.95-2.94-.92.04-2.03.61-2.69 1.38-.59.69-1.11 1.79-.97 2.85 1.03.08 2.07-.52 2.71-1.29Z" />
    </svg>
  );
}
