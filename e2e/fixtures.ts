import { test as base, expect } from "@playwright/test";

/** Cookie the app reads to pick the UI language (mirrors LOCALE_COOKIE in src/i18n). */
const LOCALE_COOKIE = "ka_locale";

/**
 * Shared test fixture that pins the UI to English.
 *
 * The app now defaults to French, so specs asserting English copy must set an
 * explicit language cookie before the first navigation — otherwise every page
 * renders in French and the assertions fail. Setting it on the context applies
 * it to every page/request in the test.
 */
export const test = base.extend({
  // The second arg is Playwright's "use" callback (named `run` here so the
  // react-hooks lint rule doesn't mistake it for the React `use` hook).
  context: async ({ context, baseURL }, run) => {
    if (baseURL) {
      await context.addCookies([{ name: LOCALE_COOKIE, value: "en", url: baseURL }]);
    }
    await run(context);
  },
});

export { expect };
