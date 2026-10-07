import { describe, it, expect } from "vitest";
import { detectCrisis, crisisReply } from "./coach-safety";
import { offlineCoachReply } from "./coaches";

describe("detectCrisis", () => {
  it("flags self-harm / suicide (en + fr)", () => {
    expect(detectCrisis("I want to kill myself")).toBe("self-harm");
    expect(detectCrisis("sometimes I think about suicide")).toBe("self-harm");
    expect(detectCrisis("j'ai envie d'en finir")).toBe("self-harm");
    expect(detectCrisis("je veux me suicider")).toBe("self-harm");
  });

  it("flags eating-disorder signs (en + fr)", () => {
    expect(detectCrisis("I make myself throw up after eating")).toBe("eating-disorder");
    expect(detectCrisis("I think I have anorexia")).toBe("eating-disorder");
    expect(detectCrisis("je me fais vomir après les repas")).toBe("eating-disorder");
  });

  it("flags dangerous medical symptoms (en + fr)", () => {
    expect(detectCrisis("I have chest pain and can't breathe")).toBe("medical");
    expect(detectCrisis("j'ai une douleur à la poitrine")).toBe("medical");
  });

  it("does not flag ordinary coaching messages", () => {
    expect(detectCrisis("I feel unmotivated and tired today")).toBeNull();
    expect(detectCrisis("give me a 20 minute workout")).toBeNull();
    expect(detectCrisis("je veux jeûner selon le jeûne de Daniel")).toBeNull();
    expect(detectCrisis("")).toBeNull();
  });
});

describe("crisisReply", () => {
  it("includes the right hotline per kind and locale", () => {
    expect(crisisReply("self-harm", "en")).toContain("9-8-8");
    expect(crisisReply("self-harm", "fr")).toContain("9-8-8");
    expect(crisisReply("medical", "en")).toContain("9-1-1");
    expect(crisisReply("eating-disorder", "fr")).toContain("NEDIC");
  });
});

describe("offlineCoachReply safety override", () => {
  it("returns the crisis script before any persona voice", () => {
    expect(offlineCoachReply("titan", "I want to end my life", "en")).toContain("9-8-8");
    expect(offlineCoachReply("barnabas", "je veux me suicider", "fr")).toContain("9-8-8");
  });

  it("still coaches normally for non-crisis messages", () => {
    expect(offlineCoachReply("forge", "I feel unmotivated today", "en")).not.toContain("9-8-8");
  });
});
