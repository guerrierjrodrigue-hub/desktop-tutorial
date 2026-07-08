import type { DevotionalContent } from "@/types";
import type { LocaleCode } from "@/i18n/locales";

const dailyDevotionalByLocale: Record<LocaleCode, DevotionalContent> = {
  en: {
    quote:
      "Discipline is the bridge between where you are and where God is calling you to be.",
    verse: {
      reference: "1 Corinthians 6:19–20",
      text: "Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God? You are not your own; you were bought at a price. Therefore honor God with your bodies.",
      translation: "NIV",
    },
    prayer:
      "Father, thank You for this new day and for the body You have entrusted to me. Give me the discipline to train it well, the humility to depend on You, and the joy of honoring You in every rep, every meal, and every quiet moment. In Jesus' name, amen.",
    reflection:
      "Physical training has value, but godliness holds promise for both this life and the next. Today, let your workout be worship — an offering of strength back to the One who gave it.",
  },
  fr: {
    quote:
      "La discipline est le pont entre l'endroit où tu es et celui où Dieu t'appelle à aller.",
    verse: {
      reference: "1 Corinthiens 6.19-20",
      text: "Ne savez-vous pas que votre corps est le temple du Saint-Esprit qui est en vous, que vous avez reçu de Dieu, et que vous ne vous appartenez point à vous-mêmes ? Car vous avez été rachetés à un grand prix. Glorifiez donc Dieu dans votre corps et dans votre esprit, qui appartiennent à Dieu.",
      translation: "LSG",
    },
    prayer:
      "Père, merci pour ce jour nouveau et pour le corps que Tu m'as confié. Donne-moi la discipline de bien l'entraîner, l'humilité de dépendre de Toi, et la joie de T'honorer dans chaque répétition, chaque repas et chaque moment de silence. Au nom de Jésus, amen.",
    reflection:
      "L'entraînement physique a de la valeur, mais la piété est utile à tous égards, pour cette vie et pour celle à venir. Aujourd'hui, que ton entraînement soit un acte d'adoration — une offrande de force à Celui qui te l'a donnée.",
  },
};

/** The daily devotional (quote + verse + prayer + reflection) in the given display language. */
export function getDailyDevotional(locale: LocaleCode): DevotionalContent {
  return dailyDevotionalByLocale[locale] ?? dailyDevotionalByLocale.en;
}

const inspirationalQuotesByLocale: Record<LocaleCode, string[]> = {
  en: [
    "Discipline is choosing between what you want now and what you want most.",
    "Your body is a gift. Stewardship is your worship.",
    "Small daily wins compound into a transformed life.",
    "Run in such a way as to get the prize. — 1 Cor. 9:24",
    "Strength of body, steadiness of soul.",
    "Motivation gets you started. Discipline keeps you going.",
    "You don't have to be extreme, just consistent.",
    "The pain of discipline weighs ounces; the pain of regret weighs tons.",
    "Progress, not perfection.",
    "Every rep, every rest, every meal is a choice — choose the version of you that you're building.",
    "Champions keep playing until they get it right.",
    "The body achieves what the mind believes.",
    "A river cuts through rock not because of its power, but its persistence.",
    "What you do today can improve all your tomorrows.",
    "Fall seven times, stand up eight.",
    "The only bad workout is the one that didn't happen.",
    "Take care of your body. It's the only place you have to live.",
    "Success is the sum of small efforts repeated day in and day out.",
    "Hardships often prepare ordinary people for an extraordinary destiny.",
    "You are stronger than you think and more capable than you know.",
    "Slow progress is still progress.",
    "Do something today that your future self will thank you for.",
    "It's not about having time, it's about making time.",
    "Consistency is what transforms average into excellence.",
    "The comeback is always stronger than the setback.",
    "Rest when you need to, but never quit.",
    "Your future is created by what you do today, not tomorrow.",
    "Strong habits build a strong life.",
    "Growth is uncomfortable, but so is staying the same when you know you could be more.",
    "Show up for yourself the way you'd show up for someone you love.",
    "Be stronger than your excuses.",
  ],
  fr: [
    "La discipline, c'est choisir entre ce que tu veux maintenant et ce que tu veux le plus.",
    "Ton corps est un don. En prendre soin, c'est ton culte.",
    "De petites victoires quotidiennes se transforment en une vie transformée.",
    "Courez de manière à remporter le prix. — 1 Co 9.24",
    "Force du corps, stabilité de l'âme.",
    "La motivation te fait démarrer. La discipline te fait continuer.",
    "Tu n'as pas besoin d'être extrême, juste constant(e).",
    "La douleur de la discipline pèse quelques grammes ; la douleur du regret pèse des tonnes.",
    "Progrès, pas perfection.",
    "Chaque répétition, chaque repos, chaque repas est un choix — choisis la version de toi que tu es en train de construire.",
    "Les champions persévèrent jusqu'à réussir.",
    "Le corps accomplit ce que l'esprit croit.",
    "Une rivière traverse la roche non par sa force, mais par sa persévérance.",
    "Ce que tu fais aujourd'hui peut améliorer tous tes lendemains.",
    "Tombe sept fois, relève-toi huit.",
    "Le seul mauvais entraînement est celui qui n'a pas eu lieu.",
    "Prends soin de ton corps. C'est le seul endroit où tu dois vivre.",
    "Le succès est la somme de petits efforts répétés jour après jour.",
    "Les épreuves préparent souvent des gens ordinaires à une destinée extraordinaire.",
    "Tu es plus fort(e) que tu ne le penses et plus capable que tu ne le crois.",
    "Un progrès lent reste un progrès.",
    "Fais aujourd'hui quelque chose que ton futur toi te remerciera d'avoir fait.",
    "Ce n'est pas une question de temps disponible, mais de temps que l'on choisit de prendre.",
    "C'est la constance qui transforme la moyenne en excellence.",
    "Le rebond est toujours plus fort que la chute.",
    "Repose-toi quand il le faut, mais n'abandonne jamais.",
    "Ton avenir se construit par ce que tu fais aujourd'hui, pas demain.",
    "De bonnes habitudes construisent une vie solide.",
    "Grandir est inconfortable, mais rester le même alors que tu sais que tu peux plus l'est tout autant.",
    "Présente-toi à toi-même comme tu le ferais pour quelqu'un que tu aimes.",
    "Sois plus fort(e) que tes excuses.",
  ],
};

/** The quote catalog to rotate through, in the given display language. */
export function getInspirationalQuotes(locale: LocaleCode): string[] {
  return inspirationalQuotesByLocale[locale] ?? inspirationalQuotesByLocale.en;
}
