/**
 * Mapping between our exercise names and Free Exercise DB IDs
 * Free Exercise DB: https://github.com/yuhonas/free-exercise-db
 *
 * Base URL for images:
 * https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{id}/{index}.jpg
 */

export const FREE_EXERCISE_DB_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

/**
 * Exercise data from Free Exercise DB
 */
export interface FreeExerciseDBEntry {
  id: string;
  name: string;
  force: "push" | "pull" | "static" | null;
  level: "beginner" | "intermediate" | "expert";
  mechanic: "compound" | "isolation" | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[]; // Relative paths like "Barbell_Curl/0.jpg"
}

/**
 * Mapping of our exercise names to Free Exercise DB IDs
 * Key: Our exercise name (lowercase, normalized)
 * Value: Free Exercise DB ID
 */
export const exerciseMapping: Record<string, string> = {
  // === CHEST ===
  "barbell bench press": "Barbell_Bench_Press_-_Medium_Grip",
  "incline dumbbell press": "Incline_Dumbbell_Press",
  "dumbbell fly": "Dumbbell_Flyes",
  "push-up": "Pushups",
  pushup: "Pushups",
  "cable crossover": "Cable_Crossover",
  "decline bench press": "Decline_Barbell_Bench_Press",

  // === BACK ===
  "barbell deadlift": "Barbell_Deadlift",
  "pull-up": "Pullups",
  pullup: "Pullups",
  "bent over barbell row": "Bent_Over_Barbell_Row",
  "lat pulldown": "Wide-Grip_Lat_Pulldown",
  "seated cable row": "Seated_Cable_Rows",
  "single-arm dumbbell row": "One-Arm_Dumbbell_Row",

  // === SHOULDERS ===
  "overhead press": "Standing_Military_Press",
  "lateral raise": "Side_Lateral_Raise",
  "front raise": "Front_Dumbbell_Raise",
  "face pull": "Face_Pull",
  "arnold press": "Arnold_Dumbbell_Press",

  // === ARMS ===
  "barbell curl": "Barbell_Curl",
  "dumbbell curl": "Dumbbell_Bicep_Curl",
  "hammer curl": "Hammer_Curls",
  "tricep pushdown": "Triceps_Pushdown",
  "skull crusher": "Lying_Triceps_Press",
  "tricep dip": "Dips_-_Triceps_Version",

  // === LEGS ===
  "barbell squat": "Barbell_Full_Squat",
  "leg press": "Leg_Press",
  "romanian deadlift": "Romanian_Deadlift",
  "leg curl": "Lying_Leg_Curls",
  "leg extension": "Leg_Extensions",
  "walking lunge": "Dumbbell_Lunges",
  "calf raise": "Standing_Calf_Raises",

  // === CORE ===
  plank: "Plank",
  crunch: "Crunches",
  "russian twist": "Russian_Twist",
  "hanging leg raise": "Hanging_Leg_Raise",
  "dead bug": "Dead_Bug",
  "ab wheel rollout": "Ab_Roller",

  // === CARDIO ===
  running: "Running_Treadmill",
  burpee: "Burpee",

  // === FLEXIBILITY ===
  "hamstring stretch": "Seated_Hamstring_Stretch",
  "hip flexor stretch": "Kneeling_Hip_Flexor",
  "cat-cow stretch": "Cat_Stretch",
  "shoulder stretch": "Shoulder_Stretch",
  "child's pose": "Childs_Pose",

  // === COMPOUND ===
  "clean and press": "Clean_and_Press",
  thruster: "Thrusters",
  "turkish get-up": "Turkish_Get-Up",
  "farmer's walk": "Farmers_Walk",
};

/**
 * Get image URLs for an exercise from Free Exercise DB
 */
export function getExerciseImageUrls(externalId: string, imageCount = 2): string[] {
  const urls: string[] = [];
  for (let i = 0; i < imageCount; i++) {
    urls.push(`${FREE_EXERCISE_DB_BASE_URL}/${externalId}/${i}.jpg`);
  }
  return urls;
}

/**
 * Get the primary image URL for an exercise
 */
export function getPrimaryImageUrl(externalId: string): string {
  return `${FREE_EXERCISE_DB_BASE_URL}/${externalId}/0.jpg`;
}

/**
 * Normalize exercise name for mapping lookup
 */
export function normalizeExerciseName(name: string): string {
  return name.toLowerCase().trim();
}

/**
 * Find Free Exercise DB ID for a given exercise name
 */
export function findExternalId(exerciseName: string): string | null {
  const normalized = normalizeExerciseName(exerciseName);
  return exerciseMapping[normalized] ?? null;
}

/**
 * Get full exercise data with images for a given exercise name
 */
export function getExerciseMediaData(exerciseName: string): {
  externalId: string | null;
  externalSource: "free-exercise-db" | null;
  primaryImage: string | null;
  images: string[];
} {
  const externalId = findExternalId(exerciseName);

  if (!externalId) {
    return {
      externalId: null,
      externalSource: null,
      primaryImage: null,
      images: [],
    };
  }

  return {
    externalId,
    externalSource: "free-exercise-db",
    primaryImage: getPrimaryImageUrl(externalId),
    images: getExerciseImageUrls(externalId),
  };
}
