import type { SetType } from "./set-row";

export interface ExerciseSet {
  id: number | string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  setType: SetType;
  isCompleted: boolean;
  targetWeight?: number | null;
  targetReps?: number | null;
}

export interface Exercise {
  id: number;
  name: string;
  category: string;
  muscleGroups?: string[];
  equipment?: string | null;
}

export interface PreviousPerformance {
  topSet: { weight: number; reps: number } | null;
  sets: Array<{
    setNumber: number;
    weight: number | null;
    reps: number | null;
    rpe: number | null;
  }>;
}

export interface ExerciseBlockProps {
  workoutExerciseId: number;
  exercise: Exercise;
  sets: ExerciseSet[];
  previousPerformance?: PreviousPerformance | null;
  supersetGroupId?: number | null;
  notes?: string | null;
  isExpanded?: boolean;
  showRestTimer?: boolean;
  restTimerSeconds?: number;
  weightUnit?: "kg" | "lb";
  onAddSet: () => void;
  onUpdateSet: (setId: number | string, data: Partial<ExerciseSet>) => void;
  onDeleteSet: (setId: number | string) => void;
  onCompleteSet: (setId: number | string) => void;
  onRemoveExercise: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  className?: string;
}
