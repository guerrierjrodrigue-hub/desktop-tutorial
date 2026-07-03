import * as Sentry from "@sentry/nextjs";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Client Sentry init. No-op unless a DSN is configured.
if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}

// Lets Sentry trace client-side navigations in the App Router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
