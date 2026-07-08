import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { APP_SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Kingdom Athlete collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="July 6, 2026"
      intro="This policy describes what information Kingdom Athlete collects when you use the app, why we collect it, and the choices you have."
      sections={[
        {
          heading: "1. Information we collect",
          body: [
            "Account information: your name, email address, and authentication details when you sign up (including via Google or Apple sign-in).",
            "Profile & activity data: height, weight, fitness goals, workout logs, habit completions, nutrition entries, prayer requests, and other content you add inside the app.",
            "Payment information: if you subscribe to a paid plan, billing is handled by Stripe. We never store your full card number — Stripe processes and stores that on our behalf.",
            "Usage data: pages visited, features used, and device/browser information, collected via PostHog to help us understand how the app is used and improve it.",
            "Error diagnostics: if something breaks, Sentry may capture technical details (like a stack trace) to help us fix the issue. We configure it to avoid capturing sensitive personal content.",
          ],
        },
        {
          heading: "2. How we use your information",
          body: [
            "To provide the core app experience — your programs, progress, streaks, and Barnabas conversations.",
            "To process subscription payments and manage your billing status.",
            "To understand product usage in aggregate so we can improve features (via PostHog analytics).",
            "To detect, diagnose, and fix bugs (via Sentry error monitoring).",
            "To communicate with you about your account, such as billing receipts or important service updates.",
          ],
        },
        {
          heading: "3. Third-party services",
          body: [
            "We rely on a small number of trusted processors to run Kingdom Athlete: Supabase (authentication and database hosting), Stripe (subscription billing), PostHog (product analytics), and Sentry (error monitoring). Each of these providers processes data only as needed to provide their service to us, under their own privacy and security terms.",
          ],
        },
        {
          heading: "4. Your choices and rights",
          body: [
            "You can view and edit most of your profile information directly from the Profile page in the app.",
            "You can cancel your subscription anytime from the billing portal — this does not delete your account or data.",
            "You may request a copy of your data or request deletion of your account by contacting us. We'll fulfill valid requests within a reasonable timeframe, except where we're required to retain certain records by law (e.g., billing history).",
          ],
        },
        {
          heading: "5. Data retention & security",
          body: [
            "We retain account data for as long as your account is active. If you delete your account, we remove your personal data within a reasonable period, other than records we're legally required to keep.",
            "We use industry-standard safeguards (encryption in transit, access controls, and row-level security on our database) to protect your information, but no system is 100% secure — we can't guarantee absolute security.",
          ],
        },
        {
          heading: "6. Children's privacy",
          body: [
            "Kingdom Athlete is not directed at children under 13, and we do not knowingly collect personal information from children under 13.",
          ],
        },
        {
          heading: "7. Changes to this policy",
          body: [
            "We may update this policy from time to time. We'll update the \"Last updated\" date above when we do, and, for material changes, we'll make a reasonable effort to notify you.",
          ],
        },
        {
          heading: "8. Contact us",
          body: [
            `Questions about this policy? Email us at ${APP_SUPPORT_EMAIL}.`,
          ],
        },
      ]}
    />
  );
}
