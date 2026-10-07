import { getCoach, type Coach } from "@/data/coaches";
import { detectCrisis, crisisReply } from "@/lib/coach-safety";
import type { LocaleCode } from "@/i18n/locales";
import type { ChatMessage } from "@/types";

/** The coach model id — overridable via COACH_MODEL for easy rollout/rollback. */
export const COACH_MODEL = process.env.COACH_MODEL ?? "claude-sonnet-5";

/** The subset of coach fields that are user-facing content and get translated. */
interface CoachText {
  tagline: string;
  greeting: string;
  suggestedPrompts: string[];
  offline: Coach["offline"];
}

/**
 * French overlays for each coach, keyed by id. Names stay as proper nouns
 * (Barnabas, Titan, Forge, Haven); only the surrounding copy is translated.
 * The `systemPrompt` is a model instruction, not user content, so it stays in
 * English — Claude still mirrors the user's language in its replies.
 */
const COACH_FR: Record<string, CoachText> = {
  barnabas: {
    tagline: "Coach foi & forme · fils d'encouragement",
    greeting:
      "Salut, je suis Barnabas — ton coach foi & forme. 🙌 Je suis là pour t'encourager, planifier ton entraînement, parler nutrition, ou simplement prier avec toi. Comment puis-je t'aider aujourd'hui ?",
    suggestedPrompts: [
      "Je manque de motivation aujourd'hui.",
      "Propose un entraînement maison de 20 minutes.",
      "Que manger après l'entraînement ?",
      "Peux-tu prier avec moi ?",
      "Comment honorer Dieu avec mon corps ?",
    ],
    offline: {
      encouragement:
        "D'abord — merci d'être là et d'être honnête. C'est déjà de la discipline. 🙌 La motivation va et vient ; c'est la fidélité que nous bâtissons. « Ceux qui se confient en l'Éternel renouvellent leur force » (Ésaïe 40:31).",
      workout:
        "J'adore. Voici un circuit complet simple de 20 minutes — 3 tours, peu de repos : squats au poids du corps, pompes, fentes arrière et une planche de 30 secondes. Bouge avec contrôle.",
      wellness:
        "Prenons une respiration ensemble. « Déchargez-vous sur lui de tous vos soucis, car il prend soin de vous » (1 Pierre 5:7). Veux-tu me parler de ce qui te pèse ?",
      fallback:
        "Je suis là pour toi — corps et âme. Dis-moi comment tu te sens aujourd'hui, ou ce sur quoi tu aimerais travailler. 💪✝️",
    },
  },
  titan: {
    tagline: "Coach performance & forme",
    greeting:
      "Je suis Coach Titan. On s'y met. Qu'est-ce qu'on entraîne aujourd'hui, ou quel objectif vises-tu ?",
    suggestedPrompts: [
      "Je manque de motivation aujourd'hui.",
      "Propose un entraînement maison de 20 minutes.",
      "Comment franchir un plateau ?",
      "Quelle est une bonne routine d'échauffement ?",
    ],
    offline: {
      encouragement:
        "Bien. Le nommer, c'est la première répétition. La motivation n'est pas fiable — présente-toi quand même. Donne-moi 10 minutes de mouvement maintenant, rien de plus.",
      workout:
        "Voici un brûleur de 20 minutes : 3 tours de squats, pompes, fentes arrière et une planche. Contrôle le tempo, pas de répétitions bâclées.",
      wellness:
        "La récupération fait aussi partie de l'entraînement. Priorise le sommeil et l'hydratation ce soir — c'est comme ça que les progrès s'installent.",
      fallback:
        "Je suis là pour t'aider à t'entraîner plus intelligemment. Dis-moi ton objectif et ce dont tu disposes aujourd'hui.",
    },
  },
  forge: {
    tagline: "Coach discipline & habitudes",
    greeting:
      "Coach Forge ici. La discipline n'est pas un sentiment, c'est un système. Qu'est-ce qu'on bâtit ou qu'on répare aujourd'hui ?",
    suggestedPrompts: [
      "J'ai brisé ma série, et maintenant ?",
      "Aide-moi à bâtir une routine matinale.",
      "Comment arrêter de procrastiner ?",
      "Je manque de motivation aujourd'hui.",
    ],
    offline: {
      encouragement:
        "Une série brisée, c'est une donnée, pas un verdict. Le système qui compte : quelle est la plus petite version de cette habitude que tu peux faire dans l'heure ? Fais ça.",
      workout:
        "Ne négocie pas avec toi-même — choisis une heure fixe, mets-la au calendrier, et traite-la comme un rendez-vous incontournable. Commence par 20 minutes aujourd'hui.",
      wellness:
        "La discipline a besoin d'un socle. Protège ta fenêtre de sommeil ce soir — tout le reste devient plus facile ensuite.",
      fallback:
        "Dis-moi ce que tu essaies de bâtir ou de briser, et concevons le plus petit prochain pas.",
    },
  },
  haven: {
    tagline: "Coach mental & bien-être",
    greeting:
      "Salut, je suis Coach Haven. Ralentissons un instant — comment vas-tu vraiment aujourd'hui ?",
    suggestedPrompts: [
      "Je me sens anxieux aujourd'hui.",
      "Aide-moi à me détendre avant de dormir.",
      "Je manque de motivation aujourd'hui.",
      "Guide-moi dans un exercice de respiration.",
    ],
    offline: {
      encouragement:
        "C'est normal que la journée semble lourde. Tu n'as pas à tout régler d'un coup — juste la prochaine petite chose. Qu'est-ce qui te semblerait faisable là, maintenant ?",
      workout:
        "Le mouvement peut être doux aujourd'hui — une marche lente ou 10 minutes d'étirements, ça compte. N'en faisons pas une pression de plus.",
      wellness:
        "Essayons une respiration lente ensemble : inspire 4, retiens 4, expire 6. Répète quelques fois et observe ce qui change.",
      fallback: "Je suis là, et rien ne presse. Dis-moi ce que tu as en tête aujourd'hui.",
    },
  },
};

/** Barnabas's deterministic French fallback branches (parallel to the English engine). */
const BARNABAS_FR = {
  prayer:
    "J'en serais honoré. Prends une lente respiration.\n\n« Père, merci pour ce corps et ce moment. Là où je suis faible, sois ma force. Là où je suis anxieux, sois ma paix. Aide-moi à m'entraîner non par vanité mais comme un acte d'adoration. Au nom de Jésus, amen. »\n\nComment te sens-tu en ce moment ?",
  unmotivated:
    "D'abord — merci d'être là et d'être honnête. C'est déjà de la discipline. 🙌 La motivation va et vient ; c'est la fidélité que nous bâtissons. Rendons la journée petite et gagnable : 10 minutes de mouvement léger et quelques respirations profondes. « Ceux qui se confient en l'Éternel renouvellent leur force » (Ésaïe 40:31). Veux-tu que je te choisisse quelque chose de doux ?",
  nutrition:
    "Excellente question. Après l'entraînement, vise des protéines + des glucides dans l'heure — par exemple du poulet grillé avec du riz, ou un smoothie protéiné aux fruits rouges. Reste sur des aliments entiers et simples. Environ 1,5 à 2 g de protéines par kilo de poids de corps sur la journée est une bonne cible. Veux-tu une idée de recette rapide ?",
  workout:
    "J'adore. Voici un circuit complet simple de 20 minutes — 3 tours, peu de repos :\n\n• Squats au poids du corps — 15\n• Pompes (sur les genoux, c'est bien) — 10\n• Fentes arrière — 10 / jambe\n• Planche — 30 secondes\n\nBouge avec contrôle et arrête si une douleur vive apparaît. Veux-tu que je le rende plus facile ou plus difficile ?",
  stewardship:
    "Belle question. L'Écriture appelle nos corps des temples du Saint-Esprit (1 Co 6.19-20). Honorer Dieu avec ton corps, ce n'est pas un physique parfait — c'est une gérance fidèle : bouger, se reposer, manger et dormir de manière à rester prêt à aimer et à servir. De petites obéissances constantes dans la durée. Quel domaine te semble le plus difficile en ce moment ?",
  fallback:
    "Je suis là pour toi — corps et âme. Dis-moi comment tu te sens aujourd'hui, ou ce sur quoi tu aimerais travailler, et nous ferons ensemble le prochain pas fidèle. 💪✝️",
};

/**
 * Return a coach localized to `locale` (French user-facing copy with English
 * fallback). Names and the system prompt are left untouched.
 */
export function localizeCoach(coach: Coach, locale: LocaleCode): Coach {
  if (locale !== "fr") return coach;
  const fr = COACH_FR[coach.id];
  if (!fr) return coach;
  return {
    ...coach,
    tagline: fr.tagline,
    greeting: fr.greeting,
    suggestedPrompts: fr.suggestedPrompts,
    offline: fr.offline,
  };
}

/**
 * Barnabas's original, deterministic warm fallback — kept intact (not
 * simplified) since he's the flagship persona. Used when no API key is
 * configured, so the coach always works in demos.
 */
function offlineBarnabasReply(userText: string, locale: LocaleCode): string {
  const t = userText.toLowerCase();
  const fr = locale === "fr";

  if (/(pray|prayer|prière|prier)/.test(t)) {
    return fr
      ? BARNABAS_FR.prayer
      : "I'd be honored to. Take a slow breath.\n\n“Father, thank You for this body and this moment. Where I am weak, be my strength. Where I am anxious, be my peace. Help me to train not for vanity but as worship. In Jesus' name, amen.”\n\nHow are you feeling right now?";
  }
  if (/(unmotivat|tired|discourag|lazy|hard|struggl|motiv|fatigu|décourag)/.test(t)) {
    return fr
      ? BARNABAS_FR.unmotivated
      : "First — thank you for showing up and being honest. That's already discipline. 🙌 Motivation comes and goes; faithfulness is what we're building. Let's make today small and winnable: 10 minutes of easy movement and a few deep breaths. “Those who hope in the Lord will renew their strength” (Isaiah 40:31). Want me to pick something gentle for you?";
  }
  if (/(eat|food|nutrition|meal|protein|diet|recipe|manger|nourriture|repas|protéine|recette)/.test(t)) {
    return fr
      ? BARNABAS_FR.nutrition
      : "Great question. After training, aim for protein + carbs within an hour or so — something like grilled chicken and rice, or a berry-protein smoothie. Keep it whole-food and simple. Roughly 0.7–1g of protein per pound of bodyweight across the day is a solid target. Want a quick recipe idea?";
  }
  if (/(workout|exercise|train|routine|entraîn|exercice)/.test(t)) {
    return fr
      ? BARNABAS_FR.workout
      : "Love it. Here's a simple 20-minute full-body circuit — 3 rounds, minimal rest:\n\n• Bodyweight squats — 15\n• Push-ups (knees are fine) — 10\n• Reverse lunges — 10 / leg\n• Plank — 30 seconds\n\nMove with control and stop if anything sharp shows up. Want me to make it easier or harder?";
  }
  if (/(honor|body|temple|steward|honor|corps|intendance)/.test(t)) {
    return fr
      ? BARNABAS_FR.stewardship
      : "Beautifully asked. Scripture calls our bodies temples of the Holy Spirit (1 Cor. 6:19–20). Honoring God with your body isn't about a perfect physique — it's faithful stewardship: moving, resting, eating, and sleeping in a way that keeps you ready to love and serve. Small, consistent obedience over time. What area feels hardest for you right now?";
  }
  return fr
    ? BARNABAS_FR.fallback
    : "I'm here for you — body and soul. Tell me how you're feeling today, or what you'd like to work on, and we'll take the next faithful step together. 💪✝️";
}

/**
 * Deterministic, persona-flavored fallback used when no ANTHROPIC_API_KEY is
 * configured. Barnabas keeps his original rich reply engine; the newer
 * personas use a simpler, shared 4-branch match against their own voice.
 * Replies are localized to `locale` (French with English fallback).
 */
export function offlineCoachReply(
  coachId: string,
  userText: string,
  locale: LocaleCode = "en",
): string {
  // Safety always comes first, before any persona voice.
  const crisis = detectCrisis(userText);
  if (crisis) return crisisReply(crisis, locale);

  const coach = localizeCoach(getCoach(coachId), locale);
  if (coach.id === "barnabas") return offlineBarnabasReply(userText, locale);

  const t = userText.toLowerCase();
  if (/(unmotivat|tired|discourag|lazy|hard|struggl|anxious|stress|motiv|fatigu|anxieu)/.test(t)) {
    return coach.offline.encouragement;
  }
  if (/(workout|exercise|train|routine|eat|food|nutrition|meal|entraîn|exercice|manger|repas)/.test(t)) {
    return coach.offline.workout;
  }
  if (/(breath|sleep|calm|mind|wind down|relax|respir|sommeil|calme|détend)/.test(t)) {
    return coach.offline.wellness;
  }
  return coach.offline.fallback;
}

export function toClaudeMessages(messages: ChatMessage[]) {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}
