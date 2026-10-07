import { describe, it, expect } from "vitest";
import { pick, BADGE_FR, CHALLENGE_FR, localizeHabitLabel } from "./content-i18n";
import { localizeCoach } from "./coaches";
import { getCoach } from "@/data/coaches";

describe("pick", () => {
  it("returns French only when locale is fr and a translation exists", () => {
    expect(pick("fr", "Hello", "Bonjour")).toBe("Bonjour");
    expect(pick("en", "Hello", "Bonjour")).toBe("Hello");
    expect(pick("fr", "Hello", null)).toBe("Hello");
    expect(pick("fr", "Hello", undefined)).toBe("Hello");
    expect(pick("fr", "Hello", "")).toBe("Hello");
  });
});

describe("localizeHabitLabel", () => {
  it("translates known default habits in French", () => {
    expect(localizeHabitLabel("Morning prayer", "fr")).toBe("Prière du matin");
    expect(localizeHabitLabel("Read Scripture", "fr")).toBe("Lire les Écritures");
  });
  it("keeps custom labels and all English labels unchanged", () => {
    expect(localizeHabitLabel("Walk the dog", "fr")).toBe("Walk the dog");
    expect(localizeHabitLabel("Morning prayer", "en")).toBe("Morning prayer");
  });
});

describe("demo translation maps", () => {
  it("covers every seeded badge and challenge title shown in demo mode", () => {
    expect(BADGE_FR["First Steps"].name).toBe("Premiers pas");
    expect(CHALLENGE_FR["40 Days of Discipline"].title).toBe("40 jours de discipline");
  });
});

describe("localizeCoach", () => {
  it("translates user-facing copy but keeps the name and system prompt", () => {
    const en = getCoach("barnabas");
    const fr = localizeCoach(en, "fr");
    expect(fr.name).toBe("Barnabas");
    expect(fr.systemPrompt).toBe(en.systemPrompt);
    expect(fr.tagline).toContain("foi");
    expect(fr.greeting).not.toBe(en.greeting);
    expect(fr.offline.fallback).not.toBe(en.offline.fallback);
  });
  it("is a no-op in English", () => {
    const en = getCoach("titan");
    expect(localizeCoach(en, "en")).toBe(en);
  });
});
