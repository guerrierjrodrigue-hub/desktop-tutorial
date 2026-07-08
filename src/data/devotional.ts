import type { DevotionalContent } from "@/types";
import type { LocaleCode } from "@/i18n/locales";

/**
 * A week's worth of devotionals per language, rotating by day-of-year (same
 * scheme as `getInspirationalQuotes` below). Verse texts are the real World
 * English Bible / Louis Segond 1910 wording — the same two public-domain
 * translations used by the Bible reader — not paraphrases.
 */
const devotionalsByLocale: Record<LocaleCode, DevotionalContent[]> = {
  en: [
    {
      quote:
        "Discipline is the bridge between where you are and where God is calling you to be.",
      verse: {
        reference: "1 Corinthians 6:19–20",
        text: "Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God? You are not your own; you were bought at a price. Therefore honor God with your bodies.",
        translation: "WEB",
      },
      prayer:
        "Father, thank You for this new day and for the body You have entrusted to me. Give me the discipline to train it well, the humility to depend on You, and the joy of honoring You in every rep, every meal, and every quiet moment. In Jesus' name, amen.",
      reflection:
        "Physical training has value, but godliness holds promise for both this life and the next. Today, let your workout be worship — an offering of strength back to the One who gave it.",
    },
    {
      quote: "Strength isn't hurried. It's renewed in waiting.",
      verse: {
        reference: "Isaiah 40:31",
        text: "but those who wait for the LORD will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint.",
        translation: "WEB",
      },
      prayer:
        "Lord, when I'm tired and my legs feel heavy, remind me that my strength comes from You, not from my own reserves. Teach me to wait on You before I push through — to pray before I perform. In Jesus' name, amen.",
      reflection:
        "Waiting on God isn't passive — it's the posture that precedes real strength. Before your next hard set or hard day, pause and remember where your endurance actually comes from.",
    },
    {
      quote: "Your strength has a source. Stay connected to it.",
      verse: {
        reference: "Philippians 4:13",
        text: "I can do all things through Christ who strengthens me.",
        translation: "WEB",
      },
      prayer:
        "Father, I don't have unlimited willpower, but You have unlimited strength. Fill the gap between what I can do and what today demands of me. In Jesus' name, amen.",
      reflection:
        "This verse isn't a promise that you'll win every competition or hit every goal — it's a promise that Christ's strength is sufficient for whatever today actually asks of you.",
    },
    {
      quote: "Train like it matters, because it does — just not for the reasons the world says.",
      verse: {
        reference: "1 Corinthians 9:24–25",
        text: "Don't you know that those who run in a race all run, but one receives the prize? Run like that, so that you may win. Every man who strives in the games exercises self-control in all things. Now they do it to receive a corruptible crown, but we an incorruptible.",
        translation: "WEB",
      },
      prayer:
        "Lord, give me the same discipline an athlete gives their body, but aimed at something that lasts forever. Let my self-control today be an act of worship, not just a training plan. In Jesus' name, amen.",
      reflection:
        "Every athlete trains for a prize that fades. Paul isn't against discipline — he's redirecting it. Let today's training point past the mirror, toward something eternal.",
    },
    {
      quote: "You're not running alone. Run light, and run with perseverance.",
      verse: {
        reference: "Hebrews 12:1",
        text: "Therefore let's also, seeing we are surrounded by so great a cloud of witnesses, lay aside every weight and the sin which so easily entangles us, and let's run with perseverance the race that is set before us,",
        translation: "WEB",
      },
      prayer:
        "God, show me what weight I'm carrying that isn't mine to carry — habits, fears, distractions. Help me set them down so I can run today's race unhindered. In Jesus' name, amen.",
      reflection:
        "Before this verse talks about running, it talks about laying weight down. Progress often isn't about adding more effort — it's about removing what's slowing you down.",
    },
    {
      quote: "No one's watching your first rep of the day. God is. Show up anyway.",
      verse: {
        reference: "Colossians 3:23",
        text: "And whatever you do, work heartily, as for the Lord and not for men,",
        translation: "WEB",
      },
      prayer:
        "Lord, let today's work — whatever it is, seen or unseen — be done for You first. Change my motivation before You change my results. In Jesus' name, amen.",
      reflection:
        "Motivation fades when no one's watching. But this verse reframes every rep, every meal, every quiet act of discipline as an offering — done for an audience of One.",
    },
    {
      quote: "Your body isn't a distraction from worship. Rightly stewarded, it's a form of it.",
      verse: {
        reference: "Romans 12:1",
        text: "Therefore I urge you, brothers, by the mercies of God, to present your bodies a living sacrifice, holy, acceptable to God, which is your spiritual service.",
        translation: "WEB",
      },
      prayer:
        "Father, I offer You this body — my training, my rest, my meals today — as a living act of worship. Let stewardship of what You've given me be one way I say thank You. In Jesus' name, amen.",
      reflection:
        "A 'living sacrifice' isn't offered once and done — it's offered daily, in ordinary choices. Today's workout and today's meals can be part of that ongoing offering.",
    },
  ],
  fr: [
    {
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
    {
      quote: "La force ne se précipite pas. Elle se renouvelle dans l'attente.",
      verse: {
        reference: "Ésaïe 40.31",
        text: "Mais ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles ; Ils courent, et ne se lassent point, Ils marchent, et ne se fatiguent point.",
        translation: "LSG",
      },
      prayer:
        "Seigneur, quand je suis fatigué et que mes jambes sont lourdes, rappelle-moi que ma force vient de Toi, et non de mes propres réserves. Apprends-moi à T'attendre avant de forcer — à prier avant de performer. Au nom de Jésus, amen.",
      reflection:
        "Attendre Dieu n'est pas passif — c'est la posture qui précède la vraie force. Avant ta prochaine série difficile ou ta prochaine journée difficile, arrête-toi et souviens-toi d'où vient réellement ton endurance.",
    },
    {
      quote: "Ta force a une source. Reste connecté à elle.",
      verse: {
        reference: "Philippiens 4.13",
        text: "Je puis tout par celui qui me fortifie.",
        translation: "LSG",
      },
      prayer:
        "Père, je n'ai pas une volonté illimitée, mais Toi Tu as une force illimitée. Comble l'écart entre ce que je peux faire et ce que cette journée exige de moi. Au nom de Jésus, amen.",
      reflection:
        "Ce verset n'est pas une promesse que tu gagneras chaque compétition ou atteindras chaque objectif — c'est la promesse que la force du Christ suffit pour ce que cette journée te demande réellement.",
    },
    {
      quote: "Entraîne-toi comme si ça comptait, parce que c'est le cas — mais pas pour les raisons que le monde avance.",
      verse: {
        reference: "1 Corinthiens 9.24-25",
        text: "Ne savez-vous pas que ceux qui courent dans le stade courent tous, mais qu'un seul remporte le prix ? Courez de manière à le remporter. Tous ceux qui combattent s'imposent toute espèce d'abstinences, et ils le font pour obtenir une couronne corruptible ; mais nous, faisons-le pour une couronne incorruptible.",
        translation: "LSG",
      },
      prayer:
        "Seigneur, donne-moi la même discipline qu'un athlète donne à son corps, mais orientée vers quelque chose qui dure pour toujours. Que ma maîtrise de moi aujourd'hui soit un acte d'adoration, pas seulement un plan d'entraînement. Au nom de Jésus, amen.",
      reflection:
        "Chaque athlète s'entraîne pour un prix qui se fane. Paul n'est pas contre la discipline — il la réoriente. Que l'entraînement d'aujourd'hui pointe au-delà du miroir, vers quelque chose d'éternel.",
    },
    {
      quote: "Tu ne cours pas seul. Cours léger, et cours avec persévérance.",
      verse: {
        reference: "Hébreux 12.1",
        text: "Nous donc aussi, puisque nous sommes environnés d'une si grande nuée de témoins, rejetons tout fardeau, et le péché qui nous enveloppe si facilement, et courons avec persévérance dans la carrière qui nous est ouverte,",
        translation: "LSG",
      },
      prayer:
        "Dieu, montre-moi le poids que je porte et qui n'est pas à moi de porter — habitudes, peurs, distractions. Aide-moi à les déposer pour courir la course d'aujourd'hui sans entrave. Au nom de Jésus, amen.",
      reflection:
        "Avant de parler de courir, ce verset parle de déposer un poids. Le progrès, ce n'est souvent pas ajouter plus d'effort — c'est retirer ce qui te ralentit.",
    },
    {
      quote: "Personne ne regarde ta première répétition de la journée. Dieu, si. Présente-toi quand même.",
      verse: {
        reference: "Colossiens 3.23",
        text: "Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes,",
        translation: "LSG",
      },
      prayer:
        "Seigneur, que le travail d'aujourd'hui — quel qu'il soit, vu ou invisible — soit fait pour Toi en premier. Change ma motivation avant de changer mes résultats. Au nom de Jésus, amen.",
      reflection:
        "La motivation s'estompe quand personne ne regarde. Mais ce verset transforme chaque répétition, chaque repas, chaque acte discret de discipline en offrande — fait pour un public d'un seul : Dieu.",
    },
    {
      quote: "Ton corps n'est pas une distraction par rapport à l'adoration. Bien géré, il en est une forme.",
      verse: {
        reference: "Romains 12.1",
        text: "Je vous exhorte donc, frères, par les compassions de Dieu, à offrir vos corps comme un sacrifice vivant, saint, agréable à Dieu, ce qui sera de votre part un culte raisonnable.",
        translation: "LSG",
      },
      prayer:
        "Père, je T'offre ce corps — mon entraînement, mon repos, mes repas d'aujourd'hui — comme un acte d'adoration vivant. Que la bonne gestion de ce que Tu m'as donné soit une façon de Te dire merci. Au nom de Jésus, amen.",
      reflection:
        "Un « sacrifice vivant » ne s'offre pas une fois pour toutes — il s'offre chaque jour, dans des choix ordinaires. L'entraînement et les repas d'aujourd'hui peuvent faire partie de cette offrande continue.",
    },
  ],
};

/** The devotional (quote + verse + prayer + reflection) for a given day, rotating weekly, in the given display language. */
export function getDailyDevotional(locale: LocaleCode, date: Date = new Date()): DevotionalContent {
  const devotionals = devotionalsByLocale[locale] ?? devotionalsByLocale.en;
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayOfYear = Math.floor((today - startOfYear) / 86_400_000);
  return devotionals[dayOfYear % devotionals.length];
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
