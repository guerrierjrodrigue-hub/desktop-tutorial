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
  "common.all": "All",

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
  "auth.forgotPasswordTitle": "Forgot your password?",
  "auth.forgotPasswordSubtitle": "Enter your email and we'll send you a reset link.",
  "auth.sendResetLink": "Send reset link",
  "auth.resetLinkSent": "If an account exists for that email, a reset link is on its way.",
  "auth.backToLogin": "Back to sign in",
  "auth.resetPasswordTitle": "Choose a new password",
  "auth.resetPasswordSubtitle": "Make it something you'll remember.",
  "auth.newPassword": "New password",
  "auth.confirmPassword": "Confirm password",
  "auth.updatePassword": "Update password",

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
  "spiritual.todaysDevotional": "Today's devotional",
  "spiritual.prayer": "Prayer",
  "spiritual.markComplete": "Mark as complete",
  "spiritual.verseMemorization": "Verse memorization",
  "spiritual.mastered": "mastered",
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

  // Onboarding wizard
  "onboarding.step": "Step",
  "onboarding.of": "of",
  "onboarding.languageTitle": "Choose your language",
  "onboarding.languageSubtitle": "You can change this anytime from your profile.",
  "onboarding.goalTitle": "What is your primary goal?",
  "onboarding.goalSubtitle": "We'll shape your daily rhythm around this.",
  "onboarding.identityTitle": "Who do you want to become?",
  "onboarding.identitySubtitle": "Pick as many as resonate — the app adapts to each one.",
  "onboarding.summaryTitle": "You're all set",
  "onboarding.summarySubtitle": "Here's the journey we're building for you.",
  "onboarding.primaryGoalLabel": "Primary goal",
  "onboarding.identitiesLabel": "Identities",
  "onboarding.back": "Back",
  "onboarding.enterApp": "Enter Kingdom Athlete",

  // Onboarding goal options
  "goal.buildMuscle": "Build Muscle",
  "goal.loseWeight": "Lose Weight",
  "goal.improveEndurance": "Improve Endurance",
  "goal.becomeDisciplined": "Become More Disciplined",
  "goal.liveHealthier": "Live Healthier",
  "goal.buildHabits": "Build Better Habits",
  "goal.improveMentalWellness": "Improve Mental Wellness",
  "goal.growSpiritually": "Grow Spiritually",
  "goal.increaseProductivity": "Increase Productivity",

  // Onboarding identity options
  "identity.athlete": "Athlete",
  "identity.disciplined": "Disciplined Person",
  "identity.christian": "Christian",
  "identity.student": "Student",
  "identity.entrepreneur": "Entrepreneur",
  "identity.wellness": "Wellness Seeker",
  "identity.parent": "Parent",
  "identity.creator": "Creator",

  // Recommendations widget
  "recommendations.matchesGoal": "Matches your goal:",
  "recommendations.wellRounded": "A well-rounded place to start.",
  "recommendations.takeFocusSession": "Take a Focus session",
  "recommendations.focusDescription": "A quiet 15-minute reset can help momentum return.",
  "recommendations.joinChallenge": "Join a challenge",
  "recommendations.communityDescription": "Iron sharpens iron — find accountability in Community.",

  // Fitness page
  "fitness.title": "Programs",
  "fitness.subtitle": "Train with intention. Every program is built around progression, form, and rest.",
  "fitness.categoryAll": "All",
  "fitness.categoryStrength": "Strength",
  "fitness.categoryFatLoss": "Fat loss",
  "fitness.categoryRunning": "Running",
  "fitness.categoryHiit": "HIIT",
  "fitness.categoryMobility": "Mobility",
  "fitness.categoryBodyweight": "Bodyweight",

  // Community page
  "community.title": "Community",
  "community.subtitle": "Encourage and be encouraged. As iron sharpens iron.",
  "community.yourGroups": "Your groups",
  "community.members": "members",
  "community.discoverGroups": "Discover groups",

  // Coach picker page
  "coach.pickerSubtitle": "Pick the coach that fits what you need today. You can switch anytime.",

  // Challenges page
  "challenges.title": "Challenges",
  "challenges.subtitle": "Discipline is easier together. Join a challenge and keep the streak alive.",
  "challenges.joined": "joined",
  "challenges.daysLeft": "days left",
  "challenges.startOwn": "Start your own challenge",
  "challenges.startOwnSubtitle": "Rally your friends or your whole church.",
  "challenges.create": "Create",
  "challenges.leaderboard": "Leaderboard",
  "challenges.you": "you",
  "challenges.personal": "Personal",
  "challenges.friends": "Friends",
  "challenges.church": "Church",
  "challenges.percentComplete": "complete",
} as const;

export default en;
/** A record of every key to a string — translated dictionaries hold different string values, not the literal English text. */
export type Dictionary = Record<keyof typeof en, string>;
export type DictionaryKey = keyof Dictionary;
