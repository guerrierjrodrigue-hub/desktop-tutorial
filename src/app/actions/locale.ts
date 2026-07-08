"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, isLocaleCode } from "@/i18n/locales";

/** Persist the visitor's chosen display language for one year. */
export async function setLocale(locale: string): Promise<void> {
  if (!isLocaleCode(locale)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/");
}
