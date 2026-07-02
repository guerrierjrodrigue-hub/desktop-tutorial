import type { Program } from "@/types";

/** Build a simple repeating week schedule for demo purposes. */
function buildSchedule(
  weeks: number,
  days: { title: string; focus: string; minutes: number; exercises: Program["schedule"][0]["days"][0]["exercises"] }[],
): Program["schedule"] {
  return Array.from({ length: weeks }, (_, w) => ({
    week: w + 1,
    days: days.map((d, i) => ({
      id: `w${w + 1}-d${i + 1}`,
      title: d.title,
      focus: d.focus,
      durationMinutes: d.minutes,
      exercises: d.exercises,
    })),
  }));
}

export const programs: Program[] = [
  {
    id: "foundations-of-strength",
    title: "Foundations of Strength",
    description:
      "Build a resilient base with compound lifts and disciplined progression. Perfect for reclaiming consistency.",
    category: "strength",
    level: "beginner",
    weeks: 8,
    daysPerWeek: 3,
    durationMinutes: 45,
    coverColor: "from-green-deep to-green",
    premium: false,
    schedule: buildSchedule(8, [
      {
        title: "Lower Body Power",
        focus: "Quads, glutes, hamstrings",
        minutes: 45,
        exercises: [
          { id: "sq", name: "Back Squat", muscles: ["Quads", "Glutes"], sets: 4, reps: "6-8", restSeconds: 120 },
          { id: "rdl", name: "Romanian Deadlift", muscles: ["Hamstrings"], sets: 3, reps: "8-10", restSeconds: 90 },
          { id: "lunge", name: "Walking Lunge", muscles: ["Glutes", "Quads"], sets: 3, reps: "12", restSeconds: 60 },
          { id: "calf", name: "Standing Calf Raise", muscles: ["Calves"], sets: 3, reps: "15", restSeconds: 45 },
        ],
      },
      {
        title: "Upper Body Push",
        focus: "Chest, shoulders, triceps",
        minutes: 45,
        exercises: [
          { id: "bp", name: "Bench Press", muscles: ["Chest", "Triceps"], sets: 4, reps: "6-8", restSeconds: 120 },
          { id: "ohp", name: "Overhead Press", muscles: ["Shoulders"], sets: 3, reps: "8-10", restSeconds: 90 },
          { id: "dip", name: "Dips", muscles: ["Triceps", "Chest"], sets: 3, reps: "10-12", restSeconds: 60 },
        ],
      },
      {
        title: "Upper Body Pull",
        focus: "Back, biceps",
        minutes: 45,
        exercises: [
          { id: "row", name: "Barbell Row", muscles: ["Back"], sets: 4, reps: "8-10", restSeconds: 90 },
          { id: "pull", name: "Pull-ups", muscles: ["Back", "Biceps"], sets: 3, reps: "AMRAP", restSeconds: 90 },
          { id: "curl", name: "Dumbbell Curl", muscles: ["Biceps"], sets: 3, reps: "12", restSeconds: 45 },
        ],
      },
    ]),
  },
  {
    id: "lean-and-disciplined",
    title: "Lean & Disciplined",
    description:
      "A metabolic conditioning plan to shed fat while building enduring habits of self-control.",
    category: "fat-loss",
    level: "intermediate",
    weeks: 6,
    daysPerWeek: 4,
    durationMinutes: 35,
    coverColor: "from-gold-deep to-bronze",
    premium: true,
    schedule: buildSchedule(6, [
      {
        title: "Full-Body Burn",
        focus: "Conditioning",
        minutes: 35,
        exercises: [
          { id: "thruster", name: "Thruster", muscles: ["Full body"], sets: 4, reps: "12", restSeconds: 45 },
          { id: "kb", name: "Kettlebell Swing", muscles: ["Posterior chain"], sets: 4, reps: "20", restSeconds: 40 },
          { id: "burpee", name: "Burpee", muscles: ["Full body"], sets: 3, reps: "15", restSeconds: 40 },
        ],
      },
    ]),
  },
  {
    id: "run-your-race",
    title: "Run Your Race",
    description:
      "Couch-to-5K progression with Scripture-paced intervals. Endurance for body and faith.",
    category: "running",
    level: "beginner",
    weeks: 9,
    daysPerWeek: 3,
    durationMinutes: 30,
    coverColor: "from-green to-green-bright",
    premium: false,
    schedule: buildSchedule(9, [
      {
        title: "Interval Run",
        focus: "Cardio base",
        minutes: 30,
        exercises: [
          { id: "warm", name: "Brisk Walk Warm-up", muscles: ["Cardio"], sets: 1, reps: "5m", restSeconds: 0 },
          { id: "run", name: "Run / Walk Intervals", muscles: ["Cardio"], sets: 6, reps: "60s run / 90s walk", restSeconds: 0 },
        ],
      },
    ]),
  },
  {
    id: "mobility-and-rest",
    title: "Mobility & Rest",
    description:
      "Restore range of motion and find stillness. Gentle flows paired with guided breath prayer.",
    category: "mobility",
    level: "beginner",
    weeks: 4,
    daysPerWeek: 5,
    durationMinutes: 20,
    coverColor: "from-elevated to-surface-2",
    premium: false,
    schedule: buildSchedule(4, [
      {
        title: "Hip & Spine Flow",
        focus: "Mobility",
        minutes: 20,
        exercises: [
          { id: "cat", name: "Cat-Cow", muscles: ["Spine"], sets: 2, reps: "10", restSeconds: 20 },
          { id: "pigeon", name: "Pigeon Stretch", muscles: ["Hips"], sets: 2, reps: "45s/side", restSeconds: 15 },
        ],
      },
    ]),
  },
  {
    id: "warrior-hiit",
    title: "Warrior HIIT",
    description:
      "High-intensity intervals to forge mental toughness. Short, brutal, effective.",
    category: "hiit",
    level: "advanced",
    weeks: 6,
    daysPerWeek: 4,
    durationMinutes: 25,
    coverColor: "from-gold to-gold-deep",
    premium: true,
    schedule: buildSchedule(6, [
      {
        title: "Tabata Assault",
        focus: "Anaerobic",
        minutes: 25,
        exercises: [
          { id: "jump", name: "Jump Squat", muscles: ["Legs"], sets: 8, reps: "20s on / 10s off", restSeconds: 10 },
          { id: "mtn", name: "Mountain Climbers", muscles: ["Core"], sets: 8, reps: "20s on / 10s off", restSeconds: 10 },
        ],
      },
    ]),
  },
  {
    id: "bodyweight-anywhere",
    title: "Bodyweight Anywhere",
    description:
      "No gym, no excuses. A full calisthenics progression you can do in a hotel room or a living room.",
    category: "bodyweight",
    level: "intermediate",
    weeks: 8,
    daysPerWeek: 4,
    durationMinutes: 30,
    coverColor: "from-green-deep to-elevated",
    premium: false,
    schedule: buildSchedule(8, [
      {
        title: "Push Focus",
        focus: "Chest, shoulders, triceps",
        minutes: 30,
        exercises: [
          { id: "pushup", name: "Push-up Variations", muscles: ["Chest"], sets: 4, reps: "12-20", restSeconds: 60 },
          { id: "pike", name: "Pike Push-up", muscles: ["Shoulders"], sets: 3, reps: "10", restSeconds: 60 },
        ],
      },
    ]),
  },
];

export function getProgram(id: string): Program | undefined {
  return programs.find((p) => p.id === id);
}

export const workoutOfDay = programs[0].schedule[0].days[0];
