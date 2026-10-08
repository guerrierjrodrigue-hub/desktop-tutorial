"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { readClientLocale } from "@/i18n/client-locale";
import "./globals.css";

const COPY = {
  en: {
    heading: "Something went wrong",
    body: "An unexpected error occurred. Please try again.",
    retry: "Try again",
  },
  fr: {
    heading: "Une erreur est survenue",
    body: "Une erreur inattendue s'est produite. Réessaie, s'il te plaît.",
    retry: "Réessayer",
  },
};

/**
 * Root error boundary — catches errors thrown in the root layout itself, where
 * the normal error.tsx cannot render. Must supply its own <html>/<body>. Reports
 * to Sentry so even top-level crashes are captured.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const locale = readClientLocale();
  const t = COPY[locale];

  return (
    <html lang={locale}>
      <body>
        <div
          style={{
            minHeight: "100svh",
            display: "grid",
            placeItems: "center",
            padding: "1.5rem",
            textAlign: "center",
            background: "#0a0b0d",
            color: "#f6f4ee",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 600 }}>{t.heading}</h1>
            <p style={{ marginTop: "0.5rem", opacity: 0.7, maxWidth: "24rem" }}>{t.body}</p>
            <button
              onClick={reset}
              style={{
                marginTop: "1.5rem",
                padding: "0.6rem 1.25rem",
                borderRadius: "999px",
                border: "none",
                background: "#d4af37",
                color: "#0a0b0d",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t.retry}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
