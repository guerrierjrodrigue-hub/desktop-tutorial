import { describe, it, expect } from "vitest";
import { offlineBarnabasReply, toOpenAIMessages, BARNABAS_SYSTEM_PROMPT } from "./barnabas";
import type { ChatMessage } from "@/types";

describe("offlineBarnabasReply", () => {
  it("offers a prayer when asked", () => {
    expect(offlineBarnabasReply("Can you pray with me?").toLowerCase()).toContain(
      "father",
    );
  });

  it("responds with empathy to discouragement", () => {
    const r = offlineBarnabasReply("I feel so unmotivated and tired");
    expect(r.toLowerCase()).toMatch(/discipline|faithful|strength/);
  });

  it("gives a workout when asked to train", () => {
    const r = offlineBarnabasReply("give me a workout");
    expect(r.toLowerCase()).toMatch(/squat|push-?up|circuit|round/);
  });

  it("gives nutrition guidance", () => {
    const r = offlineBarnabasReply("what should I eat after training?");
    expect(r.toLowerCase()).toMatch(/protein|carb|meal|recipe/);
  });

  it("always returns a non-empty, encouraging fallback", () => {
    expect(offlineBarnabasReply("").length).toBeGreaterThan(0);
    expect(offlineBarnabasReply("random unrelated text").length).toBeGreaterThan(0);
  });
});

describe("toOpenAIMessages", () => {
  it("prepends the system prompt and preserves the conversation", () => {
    const history: ChatMessage[] = [
      { id: "1", role: "user", content: "hi" },
      { id: "2", role: "assistant", content: "hello" },
    ];
    const out = toOpenAIMessages(history);
    expect(out[0]).toEqual({ role: "system", content: BARNABAS_SYSTEM_PROMPT });
    expect(out).toHaveLength(3);
    expect(out[1].content).toBe("hi");
  });
});
