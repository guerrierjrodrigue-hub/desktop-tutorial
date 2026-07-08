"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { LOCALES, type LocaleCode } from "@/i18n/locales";
import { setLocale } from "@/app/actions/locale";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  currentLocale,
  dict,
}: {
  currentLocale: LocaleCode;
  dict: Dictionary;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(code: LocaleCode) {
    startTransition(async () => {
      await setLocale(code);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <Languages className="size-4" /> {dict["settings.languageTitle"]}
          </span>
        </CardTitle>
      </CardHeader>
      <p className="text-sm text-muted">{dict["settings.languageSubtitle"]}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {LOCALES.map((locale) => (
          <button
            key={locale.code}
            type="button"
            disabled={pending}
            onClick={() => choose(locale.code)}
            aria-pressed={currentLocale === locale.code}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-sm font-medium transition disabled:opacity-60",
              currentLocale === locale.code
                ? "border-gold/50 bg-gold/15 text-gold-bright"
                : "border-border bg-surface-2 hover:border-gold/30",
            )}
          >
            {locale.nativeLabel}
          </button>
        ))}
      </div>
    </Card>
  );
}
