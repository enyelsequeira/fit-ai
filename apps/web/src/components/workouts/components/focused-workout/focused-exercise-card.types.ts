import type { WorkoutSet } from "../../types";

export interface ExerciseCardData {
  exerciseName: string;
  exerciseCategory?: string;
  exerciseEquipment?: string;
  currentSetIndex: number;
  totalSets: number;
  completedSets: WorkoutSet[];
  currentSet: WorkoutSet | null;
  previousSet?: { weight: number | null; reps: number | null };
}

export interface ExerciseCardActions {
  onSetComplete: (weight: number, reps: number, rpe?: number) => void;
  onAddSet: () => void;
}

export interface FocusedExerciseCardProps {
  data: ExerciseCardData;
  actions: ExerciseCardActions;
  isLoading?: boolean;
}
