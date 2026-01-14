/**
 * Shared types for CheckInSummary components
 */

export type Mood = "great" | "good" | "neutral" | "low" | "bad";

export interface CheckInData {
  id: number;
  userId: string;
  date: string;
  sleepHours: number | null;
  sleepQuality: number | null;
  energyLevel: number | null;
  stressLevel: number | null;
  sorenessLevel: number | null;
  soreAreas: string[] | null;
  restingHeartRate: number | null;
  hrvScore: number | null;
  motivationLevel: number | null;
  mood: Mood | null;
  nutritionQuality: number | null;
  hydrationLevel: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckInSummaryProps {
  checkIn: CheckInData | null;
  isLoading?: boolean;
  onEdit?: () => void;
  onCreateNew?: () => void;
}
