import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { APP_SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Kingdom Athlete.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="July 6, 2026"
      intro="These terms govern your access to and use of Kingdom Athlete. By creating an account or using the app, you agree to them."
      sections={[
        {
          heading: "1. Using Kingdom Athlete",
          body: [
            "You must be at least 16 years old to create an account. You're responsible for keeping your login credentials secure and for all activity under your account.",
            "You agree not to misuse the service — including attempting to access other users' data, disrupt the app, or use it for any unlawful purpose.",
          ],
        },
        {
          heading: "2. Not medical advice",
          body: [
            "Kingdom Athlete, including workouts, nutrition guidance, and Barnabas (our AI coach), is provided for general fitness and wellness purposes only. It is not medical, dietary, or mental health advice, and Barnabas is not a licensed professional.",
            "Consult a physician before beginning any new exercise or nutrition program, especially if you have an existing health condition. You assume all risk associated with physical activity undertaken through the app.",
          ],
        },
        {
          heading: "3. Subscriptions & billing",
          body: [
            "Some features require a paid subscription, billed monthly or annually through Stripe. Subscriptions renew automatically until canceled.",
            "You can cancel anytime from the billing portal; you'll retain access until the end of your current billing period. Refunds, where offered (such as our 30-day money-back guarantee), are described at the time of purchase.",
          ],
        },
        {
          heading: "4. Your content",
          body: [
            "You retain ownership of the content you create in the app — prayer requests, journal entries, community posts, and the like. By posting to community areas, you grant us a license to display that content within the app to other users as intended by the feature.",
            "You're responsible for what you post. Content that is abusive, harassing, or unlawful may be removed, and repeat violations may result in account suspension.",
          ],
        },
        {
          heading: "5. Intellectual property",
          body: [
            "Kingdom Athlete's programs, branding, design, and software are owned by us or our licensors and protected by intellectual property law. Your subscription gives you a personal, non-transferable license to use the app — it doesn't transfer ownership of anything.",
          ],
        },
        {
          heading: "6. Disclaimers & limitation of liability",
          body: [
            "The app is provided \"as is\" without warranties of any kind. To the maximum extent permitted by law, Kingdom Athlete is not liable for indirect, incidental, or consequential damages arising from your use of the app, including any injury resulting from exercise undertaken through it.",
          ],
        },
        {
          heading: "7. Termination",
          body: [
            "You may stop using the app and delete your account at any time. We may suspend or terminate accounts that violate these terms.",
          ],
        },
        {
          heading: "8. Changes to these terms",
          body: [
            "We may update these terms from time to time. Continued use of the app after changes take effect constitutes acceptance of the updated terms.",
          ],
        },
        {
          heading: "9. Contact us",
          body: [`Questions about these terms? Email us at ${APP_SUPPORT_EMAIL}.`],
        },
      ]}
    />
  );
}
