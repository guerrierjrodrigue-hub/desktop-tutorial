import type { LocaleCode } from "@/i18n/locales";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readMinutes: number;
  content: string[];
  // French translations (English fields are the fallback).
  titleFr: string;
  excerptFr: string;
  contentFr: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "train-like-its-worship",
    title: "Train Like It's Worship: 5 Ways to Reframe Your Workout",
    excerpt:
      "Your workout doesn't have to compete with your quiet time. Here's how to make the barbell part of the same act of devotion.",
    author: "Kingdom Athlete Team",
    date: "2026-05-04",
    readMinutes: 5,
    content: [
      "Most of us were taught to separate the physical from the spiritual — one hour for the gym, another for the Word, and never the two shall meet. But Scripture doesn't draw that line. \"Do you not know that your bodies are temples of the Holy Spirit?\" Paul asks in 1 Corinthians 6:19. If that's true, a workout can be worship, not a distraction from it.",
      "Here are five small shifts that changed how our team trains.",
      "1. Start with a breath, not a playlist. Before the first rep, take thirty seconds of silence. Thank God for a body that can move at all — a gift a lot of people don't have on a given day.",
      "2. Name what you're training for. Strength isn't the goal; stewardship is. You're building a body that can serve, carry, kneel, and show up for the people who need you.",
      "3. Let struggle be a teacher, not an enemy. The failed rep, the slow mile — these are small rehearsals for perseverance. James 1:2-4 was written for your legs on squat day too.",
      "4. Replace the mirror with a mission. Vanity asks \"how do I look?\" Stewardship asks \"what is this body for?\" The second question makes consistency a lot easier to sustain.",
      "5. End in gratitude, not exhaustion. However hard the session, close it the same way you'd close a prayer — with thanks, not self-criticism.",
      "None of this requires new equipment. It just asks you to notice that the discipline you're building in the gym and the discipline you're building in your walk with God were never two different muscles.",
    ],
    titleFr: "S'entraîner comme une adoration : 5 façons de repenser ta séance",
    excerptFr:
      "Ta séance n'a pas à rivaliser avec ton temps de prière. Voici comment faire de la barre un même acte de dévotion.",
    contentFr: [
      "On nous a appris à séparer le physique du spirituel — une heure pour la salle, une autre pour la Parole, sans jamais que les deux se rencontrent. Mais l'Écriture ne trace pas cette ligne. « Ne savez-vous pas que votre corps est le temple du Saint-Esprit ? » demande Paul en 1 Corinthiens 6.19. Si c'est vrai, une séance peut être une adoration, pas une distraction qui t'en éloigne.",
      "Voici cinq petits ajustements qui ont changé la façon dont notre équipe s'entraîne.",
      "1. Commence par un souffle, pas par une playlist. Avant la première répétition, prends trente secondes de silence. Remercie Dieu pour un corps capable de bouger — un cadeau que beaucoup n'ont pas certains jours.",
      "2. Nomme ce pour quoi tu t'entraînes. Le but n'est pas la force, c'est la gérance. Tu bâtis un corps capable de servir, de porter, de s'agenouiller et d'être présent pour ceux qui ont besoin de toi.",
      "3. Laisse l'effort être un maître, pas un ennemi. La répétition ratée, le kilomètre lent — ce sont de petites répétitions de la persévérance. Jacques 1.2-4 a aussi été écrit pour tes jambes un jour de squat.",
      "4. Remplace le miroir par une mission. La vanité demande « de quoi ai-je l'air ? » La gérance demande « à quoi sert ce corps ? » La deuxième question rend la régularité bien plus facile à tenir.",
      "5. Termine dans la gratitude, pas dans l'épuisement. Aussi dure soit la séance, conclus-la comme tu conclurais une prière — par des remerciements, pas par de l'autocritique.",
      "Rien de tout cela ne demande de nouveau matériel. Il s'agit juste de remarquer que la discipline que tu bâtis à la salle et celle que tu bâtis dans ta marche avec Dieu n'ont jamais été deux muscles différents.",
    ],
  },
  {
    slug: "strength-isaiah-40-31",
    title: "The Strength Isaiah 40:31 Actually Promises",
    excerpt:
      "\"Those who hope in the Lord will renew their strength\" gets quoted at every finish line. Here's what it actually meant — and what it means for your next rest day.",
    author: "Kingdom Athlete Team",
    date: "2026-04-18",
    readMinutes: 4,
    content: [
      "\"Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.\" It's one of the most quoted verses in fitness culture — stitched onto gym walls and finish-line banners everywhere.",
      "But read it in context (Isaiah 40) and it's not actually about athletic performance. It's written to an exhausted, exiled people who felt forgotten by God. The promise isn't that faith makes you tireless. It's that hope — actively waiting on God — is what sustains you through seasons where your own strength runs out.",
      "That reframes rest days entirely. A rest day isn't a failure of discipline; it's an enactment of the very posture this verse describes — trusting that your worth and your progress don't depend on grinding without pause.",
      "Practically, that might look like: taking your rest day without guilt, praying instead of scrolling during a recovery walk, or simply admitting on a hard week that your strength alone isn't enough — and that's the point.",
      "Eagles don't flap constantly. They ride currents they didn't create. Train hard. Rest on purpose. Hope isn't the opposite of effort — it's what makes effort sustainable.",
    ],
    titleFr: "La force qu'Ésaïe 40.31 promet vraiment",
    excerptFr:
      "« Ceux qui se confient en l'Éternel renouvellent leur force » se cite à chaque ligne d'arrivée. Voici ce que cela signifiait vraiment — et ce que cela veut dire pour ton prochain jour de repos.",
    contentFr: [
      "« Ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent leur vol comme les aigles ; ils courent, et ne se lassent point, ils marchent, et ne se fatiguent point. » C'est l'un des versets les plus cités de la culture fitness — brodé sur les murs des salles et les banderoles d'arrivée.",
      "Mais lu dans son contexte (Ésaïe 40), il ne parle pas de performance sportive. Il est écrit à un peuple épuisé, en exil, qui se sentait oublié de Dieu. La promesse n'est pas que la foi te rend infatigable. C'est que l'espérance — attendre activement en Dieu — est ce qui te soutient dans les saisons où ta propre force s'épuise.",
      "Cela change complètement le sens des jours de repos. Un jour de repos n'est pas un manque de discipline ; c'est la mise en pratique de la posture même que décrit ce verset — avoir confiance que ta valeur et tes progrès ne dépendent pas d'un effort sans pause.",
      "Concrètement, cela peut ressembler à : prendre ton jour de repos sans culpabilité, prier au lieu de scroller pendant une marche de récupération, ou simplement reconnaître, lors d'une semaine difficile, que ta seule force ne suffit pas — et c'est précisément le point.",
      "Les aigles ne battent pas des ailes sans arrêt. Ils portent sur des courants qu'ils n'ont pas créés. Entraîne-toi dur. Repose-toi volontairement. L'espérance n'est pas le contraire de l'effort — c'est ce qui rend l'effort durable.",
    ],
  },
  {
    slug: "building-a-habit-that-sticks",
    title: "What the Research on Habit Formation Means for Your 40-Day Challenge",
    excerpt:
      "Motivation fades by design. Here's what behavioral science says actually keeps people showing up — and how our 40 Days of Discipline challenge is built around it.",
    author: "Kingdom Athlete Team",
    date: "2026-03-02",
    readMinutes: 6,
    content: [
      "Every challenge season, people join our 40 Days of Discipline challenge — a workout and a devotional, every day, for forty days — full of motivation. And motivation, by its nature, doesn't last forty days. That's not a character flaw; it's how motivation works.",
      "So what actually predicts whether a habit sticks? A few well-documented patterns from habit-formation research are worth building your own rhythm around.",
      "First, consistency of timing beats intensity of effort. Anchoring a habit to a fixed time or an existing routine — \"implementation intentions,\" in the research literature — makes people dramatically more likely to follow through than a vague intention to \"find time somewhere.\"",
      "Second, don't aim for a perfect streak — aim to never miss twice in a row. A single missed day barely dents long-term habit formation. A missed day that turns into a missed week is what actually breaks a habit. Plan for the slip; just don't let it compound.",
      "Third, accountability changes outcomes. People pursuing a goal alongside someone else — a spouse, a small group, a church team on a shared leaderboard — consistently report higher follow-through than people going it alone.",
      "None of this is surprising once you say it out loud, but it's worth saying: discipline isn't a personality trait some people have and others don't. It's a handful of small, repeatable structures — a fixed time, a short memory for missed days, and someone else in the fight with you. That's exactly why the 40 Days of Discipline challenge is built around a daily time, a forgiving streak, and a leaderboard — not willpower alone.",
    ],
    titleFr: "Ce que la recherche sur les habitudes dit de ton défi de 40 jours",
    excerptFr:
      "La motivation s'estompe par nature. Voici ce que la science du comportement dit sur ce qui fait vraiment revenir les gens — et comment notre défi « 40 jours de discipline » est bâti autour de ça.",
    contentFr: [
      "À chaque saison de défi, des gens rejoignent notre défi « 40 jours de discipline » — un entraînement et une méditation, chaque jour, pendant quarante jours — pleins de motivation. Et la motivation, par nature, ne dure pas quarante jours. Ce n'est pas un défaut de caractère ; c'est ainsi que fonctionne la motivation.",
      "Alors qu'est-ce qui prédit vraiment qu'une habitude tienne ? Quelques tendances bien documentées par la recherche sur la formation des habitudes méritent qu'on bâtisse son rythme autour d'elles.",
      "D'abord, la régularité de l'horaire l'emporte sur l'intensité de l'effort. Ancrer une habitude à une heure fixe ou à une routine existante — les « intentions de mise en œuvre » dans la littérature — rend le suivi bien plus probable qu'une vague intention de « trouver un moment ».",
      "Ensuite, ne vise pas une série parfaite — vise à ne jamais manquer deux fois de suite. Un seul jour manqué entame à peine la formation d'une habitude. C'est un jour manqué qui devient une semaine manquée qui brise vraiment une habitude. Prévois le faux pas ; empêche-le simplement de s'enchaîner.",
      "Troisièmement, la responsabilité partagée change les résultats. Les personnes qui poursuivent un objectif avec quelqu'un d'autre — un conjoint, un petit groupe, une équipe d'église sur un classement commun — rapportent régulièrement un meilleur suivi que celles qui avancent seules.",
      "Rien de tout cela n'est surprenant une fois dit à voix haute, mais ça vaut la peine de le dire : la discipline n'est pas un trait de personnalité que certains ont et d'autres non. C'est une poignée de petites structures répétables — une heure fixe, une mémoire courte pour les jours manqués, et quelqu'un d'autre dans le combat avec toi. C'est exactement pour ça que le défi « 40 jours de discipline » est bâti autour d'une heure quotidienne, d'une série indulgente et d'un classement — pas de la seule volonté.",
    ],
  },
];

/** A blog post with its fields resolved to the given locale (English fallback). */
export interface LocalizedBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readMinutes: number;
  content: string[];
}

export function localizeBlogPost(post: BlogPost, locale: LocaleCode): LocalizedBlogPost {
  const fr = locale === "fr";
  return {
    slug: post.slug,
    title: fr ? post.titleFr : post.title,
    excerpt: fr ? post.excerptFr : post.excerpt,
    author: post.author,
    date: post.date,
    readMinutes: post.readMinutes,
    content: fr ? post.contentFr : post.content,
  };
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
