import { describe, it, expect } from "vitest";
import { COACHES, COACH_ICONS } from "@/data/coaches";
import { localizeCoach, offlineCoachReply } from "@/lib/coaches";

const EM_DASH = /—/;
const EMOJI = /\p{Extended_Pictographic}/u;

describe("coach greetings and suggestions are clean (no em dash, no emoji)", () => {
  for (const locale of ["en", "fr"] as const) {
    for (const base of COACHES) {
      const coach = localizeCoach(base, locale);

      it(`${coach.id} [${locale}] greeting is clean`, () => {
        expect(EM_DASH.test(coach.greeting), coach.greeting).toBe(false);
        expect(EMOJI.test(coach.greeting), coach.greeting).toBe(false);
      });

      it(`${coach.id} [${locale}] suggestions are clean`, () => {
        for (const s of coach.suggestedPrompts) {
          expect(EM_DASH.test(s), s).toBe(false);
          expect(EMOJI.test(s), s).toBe(false);
        }
      });
    }
  }
});

describe("offline / fallback replies are clean (no em dash, no emoji)", () => {
  // One prompt per branch of the offline engines (encouragement, workout,
  // nutrition, prayer, wellness, generic) so every fallback string is exercised.
  const prompts = [
    "I'm feeling unmotivated today",
    "design a workout",
    "what should I eat after training",
    "can you pray with me",
    "help me wind down and breathe",
    "how do I honor God with my body",
    "hello there",
  ];
  for (const locale of ["en", "fr"] as const) {
    for (const base of COACHES) {
      for (const p of prompts) {
        it(`${base.id} [${locale}] "${p}" is clean`, () => {
          const reply = offlineCoachReply(base.id, p, locale);
          expect(EM_DASH.test(reply), reply).toBe(false);
          expect(EMOJI.test(reply), reply).toBe(false);
        });
      }
    }
  }
});

describe("each coach is visually distinct", () => {
  it("has a unique icon per coach (not a shared sparkle)", () => {
    const icons = new Set(COACHES.map((c) => COACH_ICONS[c.id]));
    expect(icons.size).toBe(COACHES.length);
    for (const c of COACHES) expect(COACH_ICONS[c.id]).toBeTruthy();
  });

  it("has a unique avatar gradient per coach", () => {
    const grads = new Set(COACHES.map((c) => c.avatarGradient));
    expect(grads.size).toBe(COACHES.length);
  });
});
