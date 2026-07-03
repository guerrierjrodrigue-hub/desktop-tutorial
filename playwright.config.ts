import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const PORT = 3765;
const baseURL = `http://localhost:${PORT}`;

// Prefer a preinstalled browser (this environment ships one) and fall back to
// Playwright's own managed browser in CI where none is baked in.
const preinstalled =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ??
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const executablePath = existsSync(preinstalled) ? preinstalled : undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    colorScheme: "dark",
    launchOptions: { executablePath },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
