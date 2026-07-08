/**
 * Canonical English dictionary — the source of truth for keys. Every other
 * dictionary in this folder must expose exactly the same keys.
 */
const en = {
  // Primary navigation (sidebar groups + items)
  "nav.dashboard": "Dashboard",
  "nav.body": "Body",
  "nav.fitness": "Fitness",
  "nav.nutrition": "Nutrition",
  "nav.mind": "Mind",
  "nav.focus": "Focus",
  "nav.journal": "Journal",
  "nav.habits": "Habits",
  "nav.purpose": "Purpose",
  "nav.spiritual": "Spiritual",
  "nav.purposeJournal": "Purpose Journal",
  "nav.community": "Community",
  "nav.challenges": "Challenges",
  "nav.coach": "Coach",
  "nav.profile": "Profile",
  "nav.admin": "Admin",
  "nav.goPremium": "Go Premium",
  "nav.goPremiumBlurb": "Unlock all programs, Barnabas coaching & advanced insights.",
  "nav.startFreeTrial": "Start free trial",

  // Common actions / words reused across the app
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.continue": "Continue",
  "common.create": "Create",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.add": "Add",
  "common.done": "Done",
  "common.customize": "Customize",
  "common.loading": "One moment…",
  "common.language": "Language",
  "common.signOut": "Sign out",

  // Auth
  "auth.welcomeBack": "Welcome back",
  "auth.createAccount": "Create your account",
  "auth.continueJourney": "Continue your daily rhythm of discipline.",
  "auth.beginJourney": "Begin your journey of body and soul.",
  "auth.signIn": "Sign in",
  "auth.signUp": "Create account",
  "auth.orWithEmail": "or with email",
  "auth.forgotPassword": "Forgot password?",
  "auth.newHere": "New to Kingdom Athlete?",
  "auth.alreadyHaveAccount": "Already have an account?",
  "auth.createOne": "Create one",
  "auth.continueWithGoogle": "Continue with Google",
  "auth.fullName": "Full name",
  "auth.emailAddress": "Email address",
  "auth.password": "Password",

  // Dashboard widget titles
  "dashboard.progress": "Level & progress",
  "dashboard.todaysWorkout": "Today's workout",
  "dashboard.todaysHabits": "Today's habits",
  "dashboard.todaysActivity": "Today's activity",
  "dashboard.devotional": "Devotional",
  "dashboard.quoteOfDay": "Quote of the day",
  "dashboard.dailyQuests": "Daily quests",
  "dashboard.transformationScore": "Transformation score",
  "dashboard.activeChallenge": "Active challenge",
  "dashboard.recommended": "Recommended for you",
  "dashboard.achievements": "Achievements",
  "dashboard.greetingMorning": "Good morning",
  "dashboard.greetingAfternoon": "Good afternoon",
  "dashboard.greetingEvening": "Good evening",
  "dashboard.level": "Level",
  "dashboard.dayStreak": "Day streak",
  "dashboard.totalXp": "Total XP",
  "dashboard.startWorkout": "Start workout",

  // Settings / language
  "settings.languageTitle": "Language",
  "settings.languageSubtitle": "Choose the language Kingdom Athlete displays in.",

  // Spiritual / Bible
  "spiritual.title": "Spiritual",
  "spiritual.subtitle": "Train the soul with the same discipline as the body.",
  "spiritual.verseOfDay": "Verse of the day",
  "spiritual.prayerOfDay": "Prayer of the day",
  "spiritual.openDevotional": "Open today's devotional",
  "spiritual.bible": "Bible",
  "spiritual.bibleSubtitle": "Read the complete Bible in French or English.",
  "spiritual.readBible": "Read the Bible",
  "spiritual.selectBook": "Book",
  "spiritual.selectChapter": "Chapter",
  "spiritual.selectTranslation": "Translation",

  // Empty states introduced by this milestone's bug fixes
  "empty.noHabitsYet": "No habits yet.",
  "empty.addFirstHabit": "Add your first one",
  "empty.noChallengesYet": "No challenges yet.",
  "empty.browseChallenges": "Browse challenges",
  "empty.noOneOnLeaderboard": "No one has joined a challenge yet — be the first.",
  "empty.noChallengesAvailable": "No challenges are available right now — check back soon.",
} as const;

export default en;
/** A record of every key to a string — translated dictionaries hold different string values, not the literal English text. */
export type Dictionary = Record<keyof typeof en, string>;
export type DictionaryKey = keyof Dictionary;
