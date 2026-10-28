import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { ConsentBanner } from "@/components/providers/consent-banner";
import { LocaleSync } from "@/components/providers/locale-sync";
import { TimezoneSync } from "@/components/providers/timezone-sync";
import { DEFAULT_LOCALE } from "@/i18n/locales";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { APP_NAME, APP_URL } from "@/lib/constants";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const tagline = dict["mkt.tagline"];
  const description = dict["mkt.meta.homeDescription"];
  const title = `${APP_NAME} — ${tagline}`;
  const ogLocale = locale === "fr" ? "fr_CA" : "en_US";

  // The file-based opengraph-image.tsx / twitter-image.tsx are injected into the
  // OG/Twitter image fields automatically, so they are not set here.
  // Google Search Console verification, rendered only when the token is set.
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;

  return {
    metadataBase: new URL(APP_URL),
    title: {
      default: title,
      template: `%s · ${APP_NAME}`,
    },
    description,
    applicationName: APP_NAME,
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
    keywords: [
      "Christian fitness",
      "faith and fitness",
      "workout app",
      "Bible reading plan",
      "prayer journal",
      "devotional",
      "discipline",
    ],
    authors: [{ name: APP_NAME }],
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: APP_NAME,
      statusBarStyle: "black-translucent",
    },
    openGraph: {
      type: "website",
      siteName: APP_NAME,
      title,
      description,
      url: APP_URL,
      locale: ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0d0b0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dict = await getDictionary(await getLocale());
  return (
    <html
      lang={DEFAULT_LOCALE}
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="bg-ambient min-h-full">
        <LocaleSync />
        <TimezoneSync />
        <AnalyticsProvider>{children}</AnalyticsProvider>
        <ConsentBanner dict={dict} />
        <SpeedInsights />
      </body>
    </html>
  );
}
