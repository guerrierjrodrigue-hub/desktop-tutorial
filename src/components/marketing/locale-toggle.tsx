"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, type LocaleCode } from "@/i18n/locales";
import { setLocale } from "@/app/actions/locale";
import { cn } from "@/lib/utils";

/** Compact FR / EN switch for the public header; same cookie as the profile setting. */
export function LocaleToggle({ current, label }: { current: LocaleCode; label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(code: LocaleCode) {
    if (code === current) return;
    startTransition(async () => {
      await setLocale(code);
      document.documentElement.lang = code;
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center rounded-full border border-border p-0.5 text-xs font-semibold"
    >
      {LOCALES.map((locale) => (
        <button
          key={locale.code}
          type="button"
          lang={locale.code}
          title={locale.nativeLabel}
          disabled={pending}
          onClick={() => choose(locale.code)}
          aria-pressed={current === locale.code}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition disabled:opacity-60",
            current === locale.code
              ? "bg-gold/15 text-gold-bright"
              : "text-muted hover:text-foreground",
          )}
        >
          {locale.code}
        </button>
      ))}
    </div>
  );
}
