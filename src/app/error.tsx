"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { readClientLocale } from "@/i18n/client-locale";

const COPY = {
  en: {
    eyebrow: "Take heart",
    heading: "Something went wrong on our end",
    body: "“Be still, and know that I am God.” We hit an unexpected error — give it another try, or head back to steady ground.",
    retry: "Try again",
    dashboard: "Open dashboard",
  },
  fr: {
    eyebrow: "Garde courage",
    heading: "Un problème est survenu de notre côté",
    body: "« Arrêtez, et sachez que je suis Dieu. » Une erreur inattendue s'est produite — réessaie, ou reviens en terrain stable.",
    retry: "Réessayer",
    dashboard: "Ouvrir le tableau de bord",
  },
};

/**
 * Route-segment error boundary. Reports the error to Sentry and shows a calm,
 * on-brand recovery screen instead of a raw crash. Covers render/data errors in
 * any route that doesn't declare its own closer boundary.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const t = COPY[readClientLocale()];

  return (
    <div className="grid min-h-svh place-items-center px-6 text-center">
      <div>
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <p className="font-serif text-6xl font-semibold text-gradient-accent">
          {t.eyebrow}
        </p>
        <h1 className="mt-4 font-serif text-2xl font-semibold">{t.heading}</h1>
        <p className="mx-auto mt-2 max-w-sm text-muted">{t.body}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={reset}>{t.retry}</Button>
          <Link href="/dashboard">
            <Button variant="secondary">{t.dashboard}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
