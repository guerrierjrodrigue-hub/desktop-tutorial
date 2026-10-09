import { describe, it, expect } from "vitest";
import en from "./dictionaries/en";
import fr from "./dictionaries/fr";

/**
 * Keys whose French value is legitimately identical to English — proper nouns,
 * brand/product names, and loanwords that are the same word in both languages.
 * Every other key MUST have a distinct French translation.
 */
const IDENTICAL_ALLOWED = new Set<string>([
  // Nav / proper nouns & loanwords
  "nav.fitness",
  "nav.nutrition",
  "nav.journal",
  "nav.coach",
  "nav.admin",
  "journal.title",
  "spiritual.bible",
  "bible.metaTitle",
  "bible.title",
  "coach.metaFallback",
  "notifications.title",
  "identity.parent",
  "category.hiit",
  "fitness.categoryHiit",
  "fitness.premium",
  "focus.pause",
  "focus.minUnit",
  "session.minUnit",
  "nutrition.caloriesAria",
  "nutrition.kcalPlaceholder",
  "nutrition.total",
  "profile.bioAria",
  "profile.statBadges",
  "dashboard.weekPlanTrain",
  "mkt.contact.metaTitle",
  "mkt.contact.badge",
  "mkt.contact.form.message",
  "mkt.about.pillar.discipline.title",
  "mkt.blog.metaTitle",
  "mkt.footer.mission",
  "mkt.footer.contact",
  "mkt.footer.blog",
  "mkt.footer.cookies",
  "mkt.plan.disciple.name",
  // Q3 additions — same word/loanword in FR
  "stats.calories",
  "nutrition.title",
  "nutrition.calories",
  "nutrition.macros",
  "meta.nutrition",
  "meta.coach",
  "meta.journal",
]);

describe("i18n en/fr parity", () => {
  it("has the same set of keys in both dictionaries", () => {
    expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort());
  });

  it("translates every key (no French value identical to English, except proper nouns)", () => {
    const offenders: string[] = [];
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      const e = en[key];
      const f = (fr as Record<string, string>)[key];
      // Only flag values that actually contain letters (skip punctuation/symbols).
      if (f === e && /[A-Za-zÀ-ÿ]{2,}/.test(e) && !IDENTICAL_ALLOWED.has(key)) {
        offenders.push(`${key} = ${JSON.stringify(e)}`);
      }
    }
    expect(offenders, `Untranslated French values:\n  ${offenders.join("\n  ")}`).toEqual([]);
  });
});
