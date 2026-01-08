/**
 * Utility functions for generating realistic mock data
 */

/**
 * Generate a random number between min and max (inclusive)
 */
export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float between min and max with specified decimal places
 */
export function randomFloatBetween(min: number, max: number, decimals = 1): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

/**
 * Pick a random item from an array
 */
export function randomFromArray<T>(arr: T[]): T {
  const item = arr[Math.floor(Math.random() * arr.length)];
  if (item === undefined) {
    throw new Error("Array is empty");
  }
  return item;
}

/**
 * Shuffle an array (Fisher-Yates)
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    const tempJ = shuffled[j];
    if (temp !== undefined && tempJ !== undefined) {
      shuffled[i] = tempJ;
      shuffled[j] = temp;
    }
  }
  return shuffled;
}

/**
 * Pick N random items from an array
 */
export function randomSubset<T>(arr: T[], count: number): T[] {
  return shuffleArray(arr).slice(0, count);
}

/**
 * Generate an array of dates between start and end
 */
export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Calculate progressive weight based on starting weight and week number
 * Simulates realistic progression of ~2.5kg per week for compounds, less for isolations
 */
export function progressiveWeight(
  startWeight: number,
  weekNumber: number,
  progressRate: number = 2.5,
): number {
  // Add some variance (+/- 10%) to make it realistic
  const variance = 1 + (Math.random() * 0.2 - 0.1);
  const progression = weekNumber * progressRate * variance;
  return Math.round((startWeight + progression) / 2.5) * 2.5; // Round to nearest 2.5
}

/**
 * Generate realistic reps based on target with some variance
 */
export function realisticReps(targetReps: number, variance: number = 2): number {
  const min = Math.max(1, targetReps - variance);
  const max = targetReps + variance;
  return randomBetween(min, max);
}

/**
 * Generate workout name based on type and muscle groups
 */
export function generateWorkoutName(type: WorkoutType, customName?: string): string {
  if (customName) return customName;

  const names: Record<WorkoutType, string[]> = {
    push: ["Push Day", "Chest & Shoulders", "Upper Push", "Pressing Day"],
    pull: ["Pull Day", "Back & Biceps", "Upper Pull", "Pulling Day"],
    legs: ["Leg Day", "Lower Body", "Legs & Glutes", "Squat Day"],
    upper: ["Upper Body", "Upper Day", "Arms & Torso"],
    lower: ["Lower Body", "Leg Day", "Hips & Legs"],
    fullBody: ["Full Body Workout", "Total Body", "Full Body Strength"],
    cardio: ["Cardio Session", "Conditioning", "Endurance Training"],
  };

  return randomFromArray(names[type]);
}

/**
 * Workout types for organization
 */
export type WorkoutType = "push" | "pull" | "legs" | "upper" | "lower" | "fullBody" | "cardio";

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

/**
 * Format date to ISO timestamp
 */
export function toTimestamp(date: Date): Date {
  return new Date(date);
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add hours to a date
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Get week number from start of period
 */
export function getWeekNumber(date: Date, startDate: Date): number {
  const diffTime = Math.abs(date.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Determine if workout should be completed based on adherence rate
 */
export function shouldCompleteWorkout(adherenceRate: number = 0.85): boolean {
  return Math.random() < adherenceRate;
}

/**
 * Generate realistic workout duration in minutes
 */
export function generateWorkoutDuration(workoutType: WorkoutType): number {
  const durations: Record<WorkoutType, [number, number]> = {
    push: [45, 75],
    pull: [45, 75],
    legs: [60, 90],
    upper: [50, 80],
    lower: [50, 80],
    fullBody: [60, 90],
    cardio: [20, 60],
  };

  const [min, max] = durations[workoutType];
  return randomBetween(min, max);
}

/**
 * Generate RPE based on set type and set number
 */
export function generateRPE(setType: string, setNumber: number, totalSets: number): number | null {
  if (setType === "warmup") return null;
  if (setType === "failure") return 10;
  if (setType === "drop") return randomBetween(8, 9);

  // Progressive difficulty - later sets are harder
  const baseRPE = setNumber === totalSets ? randomBetween(8, 9) : randomBetween(6, 8);
  return Math.min(10, baseRPE);
}

/**
 * Calculate workout volume (total weight x reps)
 */
export function calculateVolume(weight: number, reps: number): number {
  return weight * reps;
}

/**
 * Base weights for common exercises (in kg) - beginner level
 */
export const baseWeights: Record<string, number> = {
  // Chest
  "Barbell Bench Press": 40,
  "Incline Dumbbell Press": 14,
  "Dumbbell Fly": 10,
  "Push-up": 0,
  "Cable Crossover": 10,
  "Decline Bench Press": 35,

  // Back
  "Barbell Deadlift": 60,
  "Pull-up": 0,
  "Bent Over Barbell Row": 40,
  "Lat Pulldown": 40,
  "Seated Cable Row": 35,
  "Single-Arm Dumbbell Row": 16,

  // Shoulders
  "Overhead Press": 30,
  "Lateral Raise": 8,
  "Front Raise": 8,
  "Face Pull": 15,
  "Arnold Press": 12,

  // Arms
  "Barbell Curl": 25,
  "Dumbbell Curl": 10,
  "Hammer Curl": 10,
  "Tricep Pushdown": 20,
  "Skull Crusher": 15,
  "Tricep Dip": 0,

  // Legs
  "Barbell Squat": 50,
  "Leg Press": 100,
  "Romanian Deadlift": 40,
  "Leg Curl": 30,
  "Leg Extension": 30,
  "Walking Lunge": 0,
  "Calf Raise": 0,

  // Core
  Plank: 0,
  Crunch: 0,
  "Russian Twist": 5,
  "Hanging Leg Raise": 0,
  "Dead Bug": 0,
  "Ab Wheel Rollout": 0,
};

/**
 * Get base weight for an exercise, with user experience modifier
 */
export function getExerciseBaseWeight(
  exerciseName: string,
  experienceLevel: "beginner" | "intermediate" | "advanced",
): number {
  const base = baseWeights[exerciseName] ?? 20;
  const multiplier =
    experienceLevel === "beginner" ? 1 : experienceLevel === "intermediate" ? 1.5 : 2;
  return Math.round((base * multiplier) / 2.5) * 2.5;
}

/**
 * Generate realistic body weight based on starting weight and weeks of training
 */
export function generateBodyWeight(
  startWeight: number,
  weekNumber: number,
  goal: "cut" | "bulk" | "maintain",
): number {
  // Weekly weight change rates
  const changeRates = {
    cut: -0.5, // Lose 0.5kg per week
    bulk: 0.25, // Gain 0.25kg per week
    maintain: 0, // No change
  };

  // Add daily variance (+/- 1kg due to water, food, etc.)
  const variance = (Math.random() * 2 - 1) * 0.5;
  const change = weekNumber * changeRates[goal] + variance;

  return Number((startWeight + change).toFixed(1));
}

/**
 * Generate realistic body fat percentage based on starting and weeks of training
 */
export function generateBodyFat(
  startBF: number,
  weekNumber: number,
  goal: "cut" | "bulk" | "maintain",
): number {
  // Weekly body fat change rates
  const changeRates = {
    cut: -0.25, // Lose 0.25% per week
    bulk: 0.1, // Gain 0.1% per week (slower fat gain with good training)
    maintain: 0,
  };

  const variance = (Math.random() * 2 - 1) * 0.3;
  const change = weekNumber * changeRates[goal] + variance;

  return Math.max(5, Math.min(35, Number((startBF + change).toFixed(1))));
}

/**
 * Calculate estimated 1RM using Epley formula
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Mood options with weighted probability (more likely to be positive)
 */
export function generateWorkoutMood(): "great" | "good" | "okay" | "tired" | "bad" {
  const rand = Math.random();
  if (rand < 0.15) return "great";
  if (rand < 0.5) return "good";
  if (rand < 0.75) return "okay";
  if (rand < 0.9) return "tired";
  return "bad";
}

/**
 * Daily mood generator
 */
export function generateDailyMood(): "great" | "good" | "neutral" | "low" | "bad" {
  const rand = Math.random();
  if (rand < 0.1) return "great";
  if (rand < 0.4) return "good";
  if (rand < 0.7) return "neutral";
  if (rand < 0.9) return "low";
  return "bad";
}

/**
 * Console logger with colored output
 */
export const log = {
  info: (msg: string) => console.log(`  ${msg}`),
  success: (msg: string) => console.log(`  \u2713 ${msg}`),
  error: (msg: string) => console.error(`  \u2717 ${msg}`),
  header: (msg: string) => console.log(`\n${msg}`),
  divider: () => console.log(""),
};
