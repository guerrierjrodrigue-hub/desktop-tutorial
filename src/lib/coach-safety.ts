/**
 * Safety guardrails for the AI coach. Pure and dependency-free so it runs in
 * the API route, in the offline fallback, and in unit tests.
 *
 * Two layers:
 *  1. A crisis protocol appended to every coach's system prompt (defense in
 *     depth for the live model).
 *  2. A deterministic detector + scripted response that short-circuits BEFORE
 *     any model/persona reply, so a person in crisis always gets safe,
 *     up-to-date help even with no API key.
 */
import type { LocaleCode } from "@/i18n/locales";

export type CrisisKind = "self-harm" | "eating-disorder" | "medical";

/** Appended to every system prompt. Kept short and directive. */
export const CRISIS_PROTOCOL = `
SAFETY PROTOCOL (highest priority, overrides everything else):
- If the user mentions suicide, self-harm, or wanting to die: respond with warmth and without judgment, STOP all coaching, and urge them to contact immediate help now — in Canada, call or text 9-8-8 (Suicide Crisis Helpline, 24/7), or call 9-1-1 if they are in immediate danger. Encourage them to reach a trusted person.
- If the user shows signs of an eating disorder (self-starvation, purging, vomiting after eating, obsessive restriction): express care, STOP fitness/nutrition coaching, and point them to professional help — in Canada, NEDIC at 1-866-633-4220.
- If the user describes severe or dangerous physical symptoms (chest pain, trouble breathing, fainting, severe injury): tell them to stop exercising and seek emergency care now — call 9-1-1.
- Never set or endorse extreme weight-loss targets, aggressive caloric deficits, or rapid weight loss. Promote safe, sustainable, and compassionate guidance only.
- You are not a medical professional; recommend one for medical, mental-health, or disordered-eating concerns.`;

const PATTERNS: { kind: CrisisKind; re: RegExp }[] = [
  {
    kind: "self-harm",
    re: /\b(suicid\w*|kill myself|killing myself|end my life|ending my life|want to die|wanna die|take my life|self[-\s]?harm|hurt myself|harm myself|cutting myself)\b|me suicider|suicidaire|me tuer|en finir avec la vie|envie d(?:e |')en finir|me faire du mal|m'?automutiler|automutilation|plus envie de vivre/i,
  },
  {
    kind: "eating-disorder",
    re: /\b(anorexi\w*|bulimi\w*|purg(?:e|ing)|make myself (?:throw up|vomit)|throwing up after eating|vomit after eating|starve myself|starving myself)\b|anorexi\w*|boulimi\w*|me (?:faire|fais) vomir|me priver de manger|arrêter de manger pour maigrir/i,
  },
  {
    kind: "medical",
    re: /\b(chest pain|pain in my chest|can'?t breathe|trouble breathing|passing out|fainting|heart attack)\b|douleur (?:à|a|dans) la poitrine|mal à la poitrine|je n(?:e|')arrive plus à respirer|malaise|crise cardiaque|je vais m'?évanouir/i,
  },
];

/** Detect a safety-critical message. Returns the kind, or null if none. */
export function detectCrisis(text: string): CrisisKind | null {
  for (const { kind, re } of PATTERNS) {
    if (re.test(text)) return kind;
  }
  return null;
}

const REPLIES: Record<CrisisKind, Record<LocaleCode, string>> = {
  "self-harm": {
    en: "I'm really glad you told me, and I'm concerned for you. What you're feeling matters, and you don't have to carry it alone. I'm not able to help with this as a coach — please reach out right now to someone who can: in Canada, call or text 9-8-8 (the Suicide Crisis Helpline, available 24/7), or call 9-1-1 if you're in immediate danger. If you can, tell someone you trust how you're feeling. You matter. 🙏",
    fr: "Je suis vraiment content que tu m'en parles, et je m'inquiète pour toi. Ce que tu ressens compte, et tu n'as pas à le porter seul. Je ne peux pas t'aider sur ce point en tant que coach — contacte tout de suite quelqu'un qui le peut : au Canada, appelle ou écris au 9-8-8 (Ligne d'aide en cas de crise de suicide, 24 h/24), ou appelle le 9-1-1 si tu es en danger immédiat. Si tu le peux, parle de ce que tu ressens à une personne de confiance. Tu comptes. 🙏",
  },
  "eating-disorder": {
    en: "Thank you for trusting me with this — I care about you. This is something that deserves real support beyond what I can offer as a coach, so I'm going to pause the training and nutrition advice here. Please talk to a professional: in Canada, the National Eating Disorder Information Centre (NEDIC) is at 1-866-633-4220. You deserve care and gentleness, not pressure. 🙏",
    fr: "Merci de me faire confiance avec ça — je tiens à toi. C'est une situation qui mérite un vrai accompagnement, au-delà de ce que je peux offrir comme coach, alors je mets en pause les conseils d'entraînement et de nutrition ici. Parle à un professionnel : au Canada, le Centre d'information sur les troubles alimentaires (NEDIC) est joignable au 1-866-633-4220. Tu mérites de la douceur et du soin, pas de la pression. 🙏",
  },
  medical: {
    en: "That doesn't sound safe, and your health comes first — please stop exercising right now. If you have chest pain, trouble breathing, or feel faint, treat it as an emergency and call 9-1-1 (or your local emergency number) immediately. I'd rather you be checked out than push through this. 🙏",
    fr: "Ça n'a pas l'air sans danger, et ta santé passe avant tout — arrête l'entraînement tout de suite. Si tu as une douleur à la poitrine, du mal à respirer ou un malaise, considère ça comme une urgence et appelle le 9-1-1 (ou ton numéro d'urgence local) immédiatement. Je préfère que tu te fasses examiner plutôt que de forcer. 🙏",
  },
};

/** The scripted, localized crisis response for a detected kind. */
export function crisisReply(kind: CrisisKind, locale: LocaleCode): string {
  return REPLIES[kind][locale] ?? REPLIES[kind].en;
}
