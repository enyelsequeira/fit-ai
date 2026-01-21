import type { UseRestTimerReturn } from "../workout-timer/use-rest-timer";

export interface NextSetPreview {
  exerciseName: string;
  setNumber: number;
  targetWeight?: number;
  targetReps?: number;
}

export interface InlineRestTimerProps {
  timer: UseRestTimerReturn;
  nextSetInfo?: NextSetPreview;
  onDismiss: () => void;
}
