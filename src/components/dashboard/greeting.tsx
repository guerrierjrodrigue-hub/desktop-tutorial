import { getCurrentUser } from "@/lib/queries/profile";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { getUserTimezone } from "@/lib/timezone";
import { localHour, greetingFor } from "@/lib/date";

const greetingKeyByPeriod = {
  morning: "greeting.morning",
  afternoon: "greeting.afternoon",
  evening: "greeting.evening",
} as const;

export async function Greeting() {
  const [currentUser, locale, tz] = await Promise.all([
    getCurrentUser(),
    getLocale(),
    getUserTimezone(),
  ]);
  const dict = await getDictionary(locale);

  const now = new Date();
  const firstName = currentUser.name.split(" ")[0];

  // Date and greeting both in the user's timezone and language.
  const dateLabel = new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: tz,
  }).format(now);

  const greeting = dict[greetingKeyByPeriod[greetingFor(localHour(tz, now))]];

  return (
    <div>
      <p className="text-sm font-medium text-gold-bright">{dateLabel}</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
        {greeting}, {firstName}.
      </h1>
      <p className="mt-1.5 text-muted">{dict["greeting.subtitle"]}</p>
    </div>
  );
}
