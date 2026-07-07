import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { APP_SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Kingdom Athlete uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="July 6, 2026"
      intro="Cookies are small text files stored on your device. We use a small number of them to keep you signed in and to understand how the app is used."
      sections={[
        {
          heading: "1. Essential cookies",
          body: [
            "These are required for the app to function — for example, keeping you signed in between visits (managed by Supabase Auth) and remembering your session while you complete checkout (managed by Stripe). The app doesn't work correctly without these, so they can't be turned off.",
          ],
        },
        {
          heading: "2. Analytics cookies",
          body: [
            "We use PostHog to understand, in aggregate, which features are used and where people run into friction — this helps us prioritize what to build next. These cookies don't identify you by name to us in any way we act on individually.",
          ],
        },
        {
          heading: "3. Error monitoring",
          body: [
            "Sentry may use minimal local storage to help us capture and diagnose crashes or errors. This is used strictly for stability and debugging, not for advertising.",
          ],
        },
        {
          heading: "4. Managing cookies",
          body: [
            "Most browsers let you block or delete cookies in their settings. Blocking essential cookies will likely prevent you from staying signed in or completing checkout. We don't use third-party advertising cookies.",
          ],
        },
        {
          heading: "5. Contact us",
          body: [`Questions about this policy? Email us at ${APP_SUPPORT_EMAIL}.`],
        },
      ]}
    />
  );
}
