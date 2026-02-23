import type { WorkoutExercise } from "../../types";

export interface FocusedExerciseCardProps {
  workoutId: number;
  exercise: WorkoutExercise;
  onSetCompleted: (info: { isLastSet: boolean }) => void;
}
