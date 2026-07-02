import type { Program } from "@/types";

type DaySpec = {
  title: string;
  focus: string;
  minutes: number;
  exercises: Program["schedule"][0]["days"][0]["exercises"];
};

/** Build a repeating week schedule for demo purposes (progression implied). */
function buildSchedule(weeks: number, days: DaySpec[]): Program["schedule"] {
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
      {
        title: "Metabolic Circuit",
        focus: "Strength endurance",
        minutes: 35,
        exercises: [
          { id: "gob", name: "Goblet Squat", muscles: ["Quads", "Glutes"], sets: 4, reps: "15", restSeconds: 40 },
          { id: "push", name: "Push-up", muscles: ["Chest"], sets: 4, reps: "15", restSeconds: 40 },
          { id: "renrow", name: "Renegade Row", muscles: ["Back", "Core"], sets: 3, reps: "10/side", restSeconds: 45 },
        ],
      },
      {
        title: "Core & Conditioning",
        focus: "Core, cardio",
        minutes: 30,
        exercises: [
          { id: "hollow", name: "Hollow Hold", muscles: ["Core"], sets: 4, reps: "30s", restSeconds: 30 },
          { id: "russ", name: "Russian Twist", muscles: ["Obliques"], sets: 3, reps: "20", restSeconds: 30 },
          { id: "row2", name: "Rowing Intervals", muscles: ["Cardio"], sets: 5, reps: "250m", restSeconds: 60 },
        ],
      },
      {
        title: "Sprint Intervals",
        focus: "Anaerobic",
        minutes: 25,
        exercises: [
          { id: "sprint", name: "Hill / Bike Sprint", muscles: ["Legs", "Cardio"], sets: 8, reps: "20s max", restSeconds: 60 },
          { id: "plank", name: "Plank", muscles: ["Core"], sets: 3, reps: "45s", restSeconds: 30 },
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
          { id: "cool", name: "Cool-down Walk", muscles: ["Recovery"], sets: 1, reps: "5m", restSeconds: 0 },
        ],
      },
      {
        title: "Tempo Run",
        focus: "Lactate threshold",
        minutes: 30,
        exercises: [
          { id: "warm2", name: "Easy Jog Warm-up", muscles: ["Cardio"], sets: 1, reps: "8m", restSeconds: 0 },
          { id: "tempo", name: "Comfortably-Hard Tempo", muscles: ["Cardio"], sets: 1, reps: "12m", restSeconds: 0 },
          { id: "cool2", name: "Cool-down", muscles: ["Recovery"], sets: 1, reps: "5m", restSeconds: 0 },
        ],
      },
      {
        title: "Long Slow Run",
        focus: "Aerobic endurance",
        minutes: 40,
        exercises: [
          { id: "long", name: "Conversational-Pace Run", muscles: ["Cardio"], sets: 1, reps: "30-40m", restSeconds: 0 },
          { id: "stretch", name: "Post-run Stretch", muscles: ["Mobility"], sets: 1, reps: "5m", restSeconds: 0 },
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
        focus: "Hips, spine",
        minutes: 20,
        exercises: [
          { id: "cat", name: "Cat-Cow", muscles: ["Spine"], sets: 2, reps: "10", restSeconds: 20 },
          { id: "pigeon", name: "Pigeon Stretch", muscles: ["Hips"], sets: 2, reps: "45s/side", restSeconds: 15 },
          { id: "worlds", name: "World's Greatest Stretch", muscles: ["Full body"], sets: 2, reps: "5/side", restSeconds: 15 },
        ],
      },
      {
        title: "Shoulder & T-Spine",
        focus: "Shoulders, upper back",
        minutes: 20,
        exercises: [
          { id: "thread", name: "Thread the Needle", muscles: ["T-spine"], sets: 2, reps: "8/side", restSeconds: 15 },
          { id: "wall", name: "Wall Angels", muscles: ["Shoulders"], sets: 3, reps: "12", restSeconds: 20 },
        ],
      },
      {
        title: "Lower Body Release",
        focus: "Hamstrings, calves",
        minutes: 18,
        exercises: [
          { id: "ham", name: "Hamstring Floss", muscles: ["Hamstrings"], sets: 2, reps: "10/side", restSeconds: 15 },
          { id: "calf2", name: "Calf Wall Stretch", muscles: ["Calves"], sets: 2, reps: "45s/side", restSeconds: 15 },
        ],
      },
      {
        title: "Full Body Flow",
        focus: "Whole body",
        minutes: 22,
        exercises: [
          { id: "sun", name: "Sun Salutation Flow", muscles: ["Full body"], sets: 3, reps: "5 breaths", restSeconds: 20 },
          { id: "deep", name: "Deep Squat Hold", muscles: ["Hips"], sets: 2, reps: "60s", restSeconds: 20 },
        ],
      },
      {
        title: "Breath & Stillness",
        focus: "Recovery, prayer",
        minutes: 15,
        exercises: [
          { id: "box", name: "Box Breathing", muscles: ["Nervous system"], sets: 4, reps: "4-4-4-4", restSeconds: 0 },
          { id: "psalm", name: "Psalm 23 Breath Prayer", muscles: ["Stillness"], sets: 1, reps: "8m", restSeconds: 0 },
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
        focus: "Anaerobic power",
        minutes: 25,
        exercises: [
          { id: "jump", name: "Jump Squat", muscles: ["Legs"], sets: 8, reps: "20s on / 10s off", restSeconds: 10 },
          { id: "mtn", name: "Mountain Climbers", muscles: ["Core"], sets: 8, reps: "20s on / 10s off", restSeconds: 10 },
        ],
      },
      {
        title: "EMOM Grind",
        focus: "Strength conditioning",
        minutes: 24,
        exercises: [
          { id: "clean", name: "Power Clean", muscles: ["Full body"], sets: 6, reps: "5 / min", restSeconds: 0 },
          { id: "wall2", name: "Wall Ball", muscles: ["Legs", "Shoulders"], sets: 6, reps: "12 / min", restSeconds: 0 },
        ],
      },
      {
        title: "AMRAP Chaos",
        focus: "Muscular endurance",
        minutes: 20,
        exercises: [
          { id: "burp2", name: "Burpee", muscles: ["Full body"], sets: 1, reps: "AMRAP 5m", restSeconds: 0 },
          { id: "ttb", name: "Toes-to-Bar", muscles: ["Core"], sets: 1, reps: "AMRAP 5m", restSeconds: 0 },
        ],
      },
      {
        title: "Finisher Ladder",
        focus: "Grit",
        minutes: 18,
        exercises: [
          { id: "thr2", name: "Thruster Ladder", muscles: ["Full body"], sets: 1, reps: "10-1 down", restSeconds: 0 },
          { id: "row3", name: "Row Sprint", muscles: ["Cardio"], sets: 3, reps: "300m", restSeconds: 60 },
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
          { id: "tri", name: "Bench Dips", muscles: ["Triceps"], sets: 3, reps: "15", restSeconds: 45 },
        ],
      },
      {
        title: "Pull Focus",
        focus: "Back, biceps",
        minutes: 30,
        exercises: [
          { id: "invrow", name: "Inverted Row", muscles: ["Back"], sets: 4, reps: "10-12", restSeconds: 60 },
          { id: "chin", name: "Chin-ups", muscles: ["Back", "Biceps"], sets: 3, reps: "AMRAP", restSeconds: 75 },
          { id: "super", name: "Superman Hold", muscles: ["Lower back"], sets: 3, reps: "30s", restSeconds: 30 },
        ],
      },
      {
        title: "Legs Focus",
        focus: "Quads, glutes, hamstrings",
        minutes: 30,
        exercises: [
          { id: "pistol", name: "Assisted Pistol Squat", muscles: ["Quads"], sets: 4, reps: "6/side", restSeconds: 60 },
          { id: "bulg", name: "Bulgarian Split Squat", muscles: ["Glutes", "Quads"], sets: 3, reps: "12/side", restSeconds: 60 },
          { id: "glute", name: "Glute Bridge", muscles: ["Glutes"], sets: 3, reps: "20", restSeconds: 40 },
        ],
      },
      {
        title: "Core Focus",
        focus: "Abs, obliques",
        minutes: 24,
        exercises: [
          { id: "hollow2", name: "Hollow Body Hold", muscles: ["Core"], sets: 4, reps: "30s", restSeconds: 30 },
          { id: "lraise", name: "Leg Raises", muscles: ["Lower abs"], sets: 3, reps: "15", restSeconds: 40 },
          { id: "sideplk", name: "Side Plank", muscles: ["Obliques"], sets: 3, reps: "40s/side", restSeconds: 30 },
        ],
      },
    ]),
  },
];

export function getProgram(id: string): Program | undefined {
  return programs.find((p) => p.id === id);
}

export const workoutOfDay = programs[0].schedule[0].days[0];
