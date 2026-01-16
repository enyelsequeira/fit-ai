export type Mood = "great" | "good" | "neutral" | "low" | "bad";

export interface CheckInData {
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

export interface CheckInFormProps {
  initialData?: CheckInData | null;
  onSubmit: (data: CheckInData) => void;
  isLoading?: boolean;
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
  "upper back",
  "lower back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "core",
  "neck",
] as const;
