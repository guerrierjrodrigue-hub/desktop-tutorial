import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary(await getLocale());

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-border bg-gradient-to-br from-green-deep via-background to-background p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-20 top-10 size-80 rounded-full bg-accent/10 blur-3xl" />
        <Logo />
        <div className="relative">
          <blockquote className="max-w-md font-serif text-3xl font-medium leading-snug">
            {dict["mkt.verse.full"]}
          </blockquote>
          <p className="mt-4 text-sm text-accent-bright">{dict["mkt.verse.fullRef"]}</p>
        </div>
        <p className="relative text-sm text-muted">{dict["mkt.tagline"]}</p>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col items-center justify-center px-6 py-12">
        <div className="absolute left-6 top-6 lg:hidden">
          <Logo />
        </div>
        {children}
        <p className="mt-10 text-center text-xs text-faint">
          {dict["mkt.auth.agreePrefix"]}{" "}
          <Link href="/terms" className="underline hover:text-muted">
            {dict["mkt.footer.terms"]}
          </Link>{" "}
          {dict["mkt.auth.and"]}{" "}
          <Link href="/privacy" className="underline hover:text-muted">
            {dict["mkt.auth.privacyPolicy"]}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
