import * as Sentry from "@sentry/nextjs";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;

/** Server/edge Sentry init. No-op unless a DSN is configured. */
export async function register() {
  if (!DSN) return;
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.1,
    enableLogs: true,
  });
}

// Surfaces server-side request errors to Sentry (safe when DSN is unset).
export const onRequestError = Sentry.captureRequestError;
