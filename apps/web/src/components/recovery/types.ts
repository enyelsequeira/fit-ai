export type Mood = "great" | "good" | "neutral" | "low" | "bad";

export type TrendPeriod = "week" | "month" | "quarter" | "year";

export interface CheckInFormData {
  sleepHours?: number;
  sleepQuality?: number;
  energyLevel?: number;
  stressLevel?: number;
  sorenessLevel?: number;
  soreAreas?: string[];
  restingHeartRate?: number;
  hrvScore?: number;
  motivationLevel?: number;
  mood?: Mood;
  nutritionQuality?: number;
  hydrationLevel?: number;
  notes?: string;
}

export const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: "great", emoji: "great", label: "Great" },
  { value: "good", emoji: "good", label: "Good" },
  { value: "neutral", emoji: "neutral", label: "Neutral" },
  { value: "low", emoji: "low", label: "Low" },
  { value: "bad", emoji: "bad", label: "Bad" },
];

export const BODY_PARTS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
] as const;
