/** Shared types and constants for the Muscle Balance widget */

export interface MuscleData {
  muscleGroup: string;
  volume: number;
  percentage: number;
  color: string;
}

export interface MuscleBalanceProps {
  data: MuscleData[];
  period: "week" | "month";
  onPeriodChange?: (period: "week" | "month") => void;
  hasImbalance?: boolean;
  imbalanceMessage?: string;
  isLoading?: boolean;
}

/** Chart dimensions */
export const CHART_SIZE = 160;
export const STROKE_WIDTH = 24;
export const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
export const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
export const CENTER = CHART_SIZE / 2;

/** Default color palette for muscle groups */
export const MUSCLE_GROUP_COLORS: Record<string, string> = {
  Chest: "var(--mantine-color-blue-5)",
  Back: "var(--mantine-color-teal-5)",
  Shoulders: "var(--mantine-color-cyan-5)",
  Arms: "var(--mantine-color-indigo-5)",
  Legs: "var(--mantine-color-green-5)",
  Core: "var(--mantine-color-yellow-5)",
};
