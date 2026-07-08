import { describe, it, expect } from "vitest";
import { offlineCoachReply, toClaudeMessages } from "./coaches";
import { COACHES, getCoach } from "@/data/coaches";
import type { ChatMessage } from "@/types";

describe("getCoach", () => {
  it("returns the matching persona", () => {
    expect(getCoach("titan").name).toBe("Coach Titan");
  });

  it("falls back to the first coach for an unknown id", () => {
    expect(getCoach("nope").id).toBe(COACHES[0].id);
  });
});

describe("offlineCoachReply", () => {
  it("offers a prayer when asked (Barnabas)", () => {
    expect(offlineCoachReply("barnabas", "Can you pray with me?").toLowerCase()).toContain(
      "father",
    );
  });

  it("responds with empathy to discouragement (Barnabas)", () => {
    const r = offlineCoachReply("barnabas", "I feel so unmotivated and tired");
    expect(r.toLowerCase()).toMatch(/discipline|faithful|strength/);
  });

  it("gives a workout when asked to train (Barnabas)", () => {
    const r = offlineCoachReply("barnabas", "give me a workout");
    expect(r.toLowerCase()).toMatch(/squat|push-?up|circuit|round/);
  });

  it("always returns a non-empty fallback for every persona", () => {
    for (const coach of COACHES) {
      expect(offlineCoachReply(coach.id, "").length).toBeGreaterThan(0);
      expect(offlineCoachReply(coach.id, "random unrelated text").length).toBeGreaterThan(0);
    }
  });

  it("gives persona-flavored encouragement for non-Barnabas coaches", () => {
    const r = offlineCoachReply("forge", "I feel unmotivated today");
    expect(r).toBe(getCoach("forge").offline.encouragement);
  });
});

describe("toClaudeMessages", () => {
  it("preserves the conversation as role/content pairs", () => {
    const history: ChatMessage[] = [
      { id: "1", role: "user", content: "hi" },
      { id: "2", role: "assistant", content: "hello" },
    ];
    expect(toClaudeMessages(history)).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ]);
  });
});
