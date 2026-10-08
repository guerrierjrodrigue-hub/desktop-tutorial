import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const DEMO_PORT = 3765;
const GUARD_PORT = 3766;
const demoURL = `http://localhost:${DEMO_PORT}`;
const guardURL = `http://localhost:${GUARD_PORT}`;

// Prefer a preinstalled browser (this environment ships one) and fall back to
// Playwright's own managed browser in CI where none is baked in.
const preinstalled =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ??
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const executablePath = existsSync(preinstalled) ? preinstalled : undefined;

// Demo mode: no Supabase configured, so the app runs on mock data and protected
// routes are open. APP_FREE_MODE mirrors the production free-beta phase.
const demoEnv = { APP_FREE_MODE: "true" };

// "Configured but unreachable" Supabase: a syntactically valid https URL that
// never resolves. The middleware then fails CLOSED on protected routes and
// redirects anonymous visitors to /login — which is what the auth-guard spec
// verifies. The host is never actually contacted for a real response.
const guardEnv = {
  APP_FREE_MODE: "true",
  NEXT_PUBLIC_SUPABASE_URL: "https://demo-unreachable.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "e2e-fake-anon-key",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    trace: "on-first-retry",
    colorScheme: "dark",
    launchOptions: { executablePath },
  },
  projects: [
    {
      // Everything except the auth-guard spec runs against the demo server.
      name: "demo",
      testIgnore: /guard\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: demoURL },
    },
    {
      // The auth-guard spec needs Supabase "configured" so the guard engages.
      name: "guard",
      testMatch: /guard\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: guardURL },
    },
  ],
  // Two servers from the same build, differing only in runtime env (middleware
  // reads NEXT_PUBLIC_SUPABASE_URL / APP_FREE_MODE at request time).
  webServer: [
    {
      command: `npm run start -- -p ${DEMO_PORT}`,
      url: demoURL,
      env: demoEnv,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npm run start -- -p ${GUARD_PORT}`,
      url: guardURL,
      env: guardEnv,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
