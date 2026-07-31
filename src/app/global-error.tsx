"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import "./globals.css";

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

  return (
    <html lang="en">
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
            <h1 style={{ fontSize: "1.75rem", fontWeight: 600 }}>
              Something went wrong
            </h1>
            <p style={{ marginTop: "0.5rem", opacity: 0.7, maxWidth: "24rem" }}>
              An unexpected error occurred. Please try again.
            </p>
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
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
