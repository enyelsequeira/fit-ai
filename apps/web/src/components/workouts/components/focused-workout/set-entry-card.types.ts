export interface SetEntryData {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  previousWeight?: number | null;
  previousReps?: number | null;
}

export interface SetEntryActions {
  onWeightChange: (value: number | null) => void;
  onRepsChange: (value: number | null) => void;
  onRpeChange: (value: number | null) => void;
  onComplete: () => void;
}

export interface SetEntryCardProps {
  data: SetEntryData;
  actions: SetEntryActions;
  isLoading?: boolean;
  disabled?: boolean;
}
