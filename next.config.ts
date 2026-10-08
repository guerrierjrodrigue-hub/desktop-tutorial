import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

/**
 * Content-Security-Policy source allowlist.
 *
 * External origins the app legitimately talks to:
 *  - Supabase (REST + realtime websocket, plus avatar/exercise storage)
 *  - PostHog analytics (ingest + static assets)
 *  - Stripe (hosted checkout / billing portal are top-level navigations, but we
 *    still allow the JS + framed widgets in case embedded checkout is used)
 *  - Sentry (browser telemetry normally tunnels same-origin via /monitoring;
 *    the ingest hosts are allowed as a fallback)
 *  - bible.helloao.org (Bible reading API)
 *  - raw.githubusercontent.com (free-exercise-db images)
 *  - Google user content (OAuth avatar images)
 *
 * Fonts are self-hosted by `next/font`, so `font-src 'self'` is enough.
 * `'unsafe-inline'` is required for the framework's inline bootstrap script and
 * for Tailwind/next-font injected styles (no nonce pipeline is configured).
 */
const SUPABASE = "https://*.supabase.co";
const SUPABASE_WS = "wss://*.supabase.co";
// PostHog serves ingest + static assets across several subdomains; the
// wildcards match whatever region/host the account is on (us.i, us-assets.i, …).
const POSTHOG = "https://*.posthog.com https://*.i.posthog.com";
const STRIPE_JS = "https://js.stripe.com";
const STRIPE_FRAME = "https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com";
const STRIPE_API = "https://api.stripe.com";
const SENTRY = "https://*.sentry.io https://*.ingest.sentry.io";
const BIBLE = "https://bible.helloao.org";

const cspDirectives: Record<string, string> = {
  "default-src": "'self'",
  "base-uri": "'self'",
  "object-src": "'none'",
  "frame-ancestors": "'none'",
  "form-action": "'self'",
  // 'unsafe-eval' is kept because PostHog's client needs it; 'unsafe-inline'
  // covers the framework's inline bootstrap script (no nonce pipeline).
  "script-src": `'self' 'unsafe-inline' 'unsafe-eval' ${POSTHOG} ${STRIPE_JS}`,
  "style-src": "'self' 'unsafe-inline'",
  // Images can't execute, so `https:` is an intentionally permissive source to
  // avoid breaking exercise images, OAuth avatars and OG images.
  "img-src": "'self' data: blob: https:",
  "font-src": "'self' data:",
  "connect-src": `'self' ${SUPABASE} ${SUPABASE_WS} ${POSTHOG} ${BIBLE} ${STRIPE_API} ${SENTRY}`,
  "frame-src": `'self' ${STRIPE_FRAME}`,
  "worker-src": "'self' blob:",
  "manifest-src": "'self'",
  "upgrade-insecure-requests": "",
};

const contentSecurityPolicy = Object.entries(cspDirectives)
  .map(([key, value]) => (value ? `${key} ${value}` : key))
  .join("; ");

/**
 * Two-phase rollout: ship the CSP in Report-Only first so violations are logged
 * without breaking anything, then flip to enforcing by setting CSP_ENFORCE=1
 * (reversible — unset it to drop back to Report-Only). All other headers are
 * always enforced.
 */
const enforceCsp = process.env.CSP_ENFORCE === "1";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: enforceCsp ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
    value: contentSecurityPolicy,
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/yuhonas/free-exercise-db/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply the security headers to every route.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

/**
 * Wrap with Sentry so production builds upload source maps (readable stack
 * traces) and route browser telemetry through a same-origin tunnel that ad
 * blockers don't clip. Source-map upload only happens when SENTRY_ORG,
 * SENTRY_PROJECT and SENTRY_AUTH_TOKEN are set at build time; otherwise the
 * build proceeds unchanged, so this is safe with no Sentry configured.
 */
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  tunnelRoute: "/monitoring",
});
