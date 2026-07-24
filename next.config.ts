import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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
