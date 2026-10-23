import { describe, it, expect } from "vitest";
import plansJson from "@/data/run-plans.json";
import lsgJson from "@/data/lsg-verses.json";

interface Bi { fr: string; en: string }
interface RawSession { title: Bi; instructions: Bi }
interface RawWeek { verseRef: Bi; verseText: Bi; prayer: Bi; sessions: RawSession[] }
interface RawPlan { title: Bi; description: Bi; weeks: RawWeek[] }
const plans = (plansJson as { plans: RawPlan[] }).plans;
const lsg = lsgJson as { ref: string; refEn: string; text: string; textEn: string }[];

/** Every French string in the run-plan content. */
function frenchStrings(): string[] {
  const out: string[] = [];
  for (const p of plans) {
    out.push(p.title.fr, p.description.fr);
    for (const w of p.weeks) {
      out.push(w.verseRef.fr, w.verseText.fr, w.prayer.fr);
      for (const s of w.sessions) out.push(s.title.fr, s.instructions.fr);
    }
  }
  return out;
}

// Known unaccented forms that must never appear in French run content. Accented
// French (manière, péché, l'Éternel, ...) does not contain these ASCII spellings,
// so a plain substring check flags only the mistakes.
const BANNED = [
  "maniere", "peche", "eternel", "esaie", "hebreux", "jesus", "coeur",
  "celeste", "seances", "fractionnes", "fractionne", "priere", "perseverance",
  "carriere", "acheve", "arriere", "legerement", "maitrise", "duree",
];

describe("run plan French content is correctly accented", () => {
  it("contains no known unaccented forms", () => {
    const offenders: string[] = [];
    for (const s of frenchStrings()) {
      const lower = s.toLowerCase();
      for (const bad of BANNED) {
        if (lower.includes(bad)) offenders.push(`"${bad}" in: ${s}`);
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("the canonical LSG verses are also accented", () => {
    const offenders: string[] = [];
    for (const v of lsg) {
      const lower = (v.ref + " " + v.text).toLowerCase();
      for (const bad of BANNED) {
        if (lower.includes(bad)) offenders.push(`"${bad}" in: ${v.ref}`);
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("shows the expected accented renderings", () => {
    const all = frenchStrings().join(" \n ");
    for (const needle of [
      "Courez de manière à le remporter",
      "l'Éternel",
      "Ésaïe",
      "Hébreux",
      "péché",
      "persévérance",
    ]) {
      expect(all, `missing accented form: ${needle}`).toContain(needle);
    }
  });
});

describe("run plan verses match the app's Bible (LSG)", () => {
  const byRef = new Map(lsg.map((v) => [v.ref, v]));

  it("every plan week verse equals the canonical LSG text for its reference", () => {
    for (const p of plans) {
      for (const w of p.weeks) {
        const canonical = byRef.get(w.verseRef.fr);
        expect(canonical, `unknown verse reference: ${w.verseRef.fr}`).toBeTruthy();
        expect(w.verseText.fr).toBe(canonical!.text);
        expect(w.verseRef.en).toBe(canonical!.refEn);
        expect(w.verseText.en).toBe(canonical!.textEn);
      }
    }
  });

  it("uses only the five intended references", () => {
    const used = new Set<string>();
    for (const p of plans) for (const w of p.weeks) used.add(w.verseRef.fr);
    expect([...used].sort()).toEqual(
      [
        "1 Corinthiens 9.24",
        "Hébreux 12.1",
        "Ésaïe 40.31",
        "2 Timothée 4.7",
        "Philippiens 3.13-14",
      ].sort(),
    );
  });
});
