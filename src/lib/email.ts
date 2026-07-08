import { Resend } from "resend";
import { APP_NAME, APP_URL } from "@/lib/constants";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "Kingdom Athlete <onboarding@resend.dev>";

export function isEmailConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

/**
 * Sends the post-signup welcome email. A no-op when Resend isn't configured,
 * and never throws — a flaky email provider must never break signup.
 *
 * Note: `onboarding@resend.dev` (the default sender until a custom domain is
 * verified with Resend) can only deliver to the Resend account's own email —
 * not to real signups. A verified domain is required before this actually
 * reaches users, which in turn requires a custom domain for the app (not the
 * shared `.vercel.app` one).
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  if (!isEmailConfigured()) return;

  try {
    const resend = new Resend(RESEND_API_KEY);
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Welcome to ${APP_NAME} 🙏💪`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h1 style="font-size: 22px;">Welcome, ${escapeHtml(name)}.</h1>
          <p style="font-size: 15px; line-height: 1.6;">
            "Do you not know that your bodies are temples of the Holy Spirit?
            Therefore honor God with your bodies." — 1 Corinthians 6:19-20
          </p>
          <p style="font-size: 15px; line-height: 1.6;">
            You've just started a journey of discipline for body and soul. Your
            dashboard is ready — habits to build, a coach to talk to, and a
            training program waiting for day one.
          </p>
          <p style="margin-top: 24px;">
            <a href="${APP_URL}/dashboard" style="background: #d4a017; color: #000; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Go to your dashboard
            </a>
          </p>
          <p style="font-size: 13px; color: #666; margin-top: 32px;">
            — The ${APP_NAME} team
          </p>
        </div>
      `,
    });
  } catch {
    // Never block signup on a flaky email provider.
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
