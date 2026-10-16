import { describe, it, expect } from "vitest";
import { COACHES } from "@/data/coaches";
import { localizeCoach } from "@/lib/coaches";

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

describe("each coach is visually distinct", () => {
  it("has a unique icon per coach (not a shared sparkle)", () => {
    const icons = new Set(COACHES.map((c) => c.icon));
    expect(icons.size).toBe(COACHES.length);
  });

  it("has a unique avatar gradient per coach", () => {
    const grads = new Set(COACHES.map((c) => c.avatarGradient));
    expect(grads.size).toBe(COACHES.length);
  });
});
