import { getCoach } from "@/data/coaches";
import type { ChatMessage } from "@/types";

/**
 * Barnabas's original, deterministic warm fallback — kept intact (not
 * simplified) since he's the flagship persona. Used when no API key is
 * configured, so the coach always works in demos.
 */
function offlineBarnabasReply(userText: string): string {
  const t = userText.toLowerCase();

  if (/(pray|prayer)/.test(t)) {
    return "I'd be honored to. Take a slow breath.\n\n“Father, thank You for this body and this moment. Where I am weak, be my strength. Where I am anxious, be my peace. Help me to train not for vanity but as worship. In Jesus' name, amen.”\n\nHow are you feeling right now?";
  }
  if (/(unmotivat|tired|discourag|lazy|hard|struggl)/.test(t)) {
    return "First — thank you for showing up and being honest. That's already discipline. 🙌 Motivation comes and goes; faithfulness is what we're building. Let's make today small and winnable: 10 minutes of easy movement and a few deep breaths. “Those who hope in the Lord will renew their strength” (Isaiah 40:31). Want me to pick something gentle for you?";
  }
  if (/(eat|food|nutrition|meal|protein|diet|recipe)/.test(t)) {
    return "Great question. After training, aim for protein + carbs within an hour or so — something like grilled chicken and rice, or a berry-protein smoothie. Keep it whole-food and simple. Roughly 0.7–1g of protein per pound of bodyweight across the day is a solid target. Want a quick recipe idea?";
  }
  if (/(workout|exercise|train|routine)/.test(t)) {
    return "Love it. Here's a simple 20-minute full-body circuit — 3 rounds, minimal rest:\n\n• Bodyweight squats — 15\n• Push-ups (knees are fine) — 10\n• Reverse lunges — 10 / leg\n• Plank — 30 seconds\n\nMove with control and stop if anything sharp shows up. Want me to make it easier or harder?";
  }
  if (/(honor|body|temple|steward)/.test(t)) {
    return "Beautifully asked. Scripture calls our bodies temples of the Holy Spirit (1 Cor. 6:19–20). Honoring God with your body isn't about a perfect physique — it's faithful stewardship: moving, resting, eating, and sleeping in a way that keeps you ready to love and serve. Small, consistent obedience over time. What area feels hardest for you right now?";
  }
  return "I'm here for you — body and soul. Tell me how you're feeling today, or what you'd like to work on, and we'll take the next faithful step together. 💪✝️";
}

/**
 * Deterministic, persona-flavored fallback used when no ANTHROPIC_API_KEY is
 * configured. Barnabas keeps his original rich reply engine; the newer
 * personas use a simpler, shared 4-branch match against their own voice.
 */
export function offlineCoachReply(coachId: string, userText: string): string {
  const coach = getCoach(coachId);
  if (coach.id === "barnabas") return offlineBarnabasReply(userText);

  const t = userText.toLowerCase();
  if (/(unmotivat|tired|discourag|lazy|hard|struggl|anxious|stress)/.test(t)) {
    return coach.offline.encouragement;
  }
  if (/(workout|exercise|train|routine|eat|food|nutrition|meal)/.test(t)) {
    return coach.offline.workout;
  }
  if (/(breath|sleep|calm|mind|wind down|relax)/.test(t)) {
    return coach.offline.wellness;
  }
  return coach.offline.fallback;
}

export function toClaudeMessages(messages: ChatMessage[]) {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}
