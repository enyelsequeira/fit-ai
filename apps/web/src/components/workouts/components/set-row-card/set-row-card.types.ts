/**
 * SetRowCard type definitions
 */

export type SetType = "warmup" | "working" | "drop" | "failure";

export interface PreviousSet {
  weight: number;
  reps: number;
}

export interface SetData {
  /** Set number to display in the badge (1, 2, 3...) */
  setNumber: number;
  /** Current weight value (null if not set) */
  weight: number | null;
  /** Current reps value (null if not set) */
  reps: number | null;
  /** Current RPE value (optional, 1-10 scale) */
  rpe?: number | null;
  /** Type of set for visual indicator */
  setType?: SetType;
  /** Whether the set has been completed */
  isCompleted?: boolean;
  /** Whether this is the current/active set */
  isCurrent?: boolean;
}

export interface SetActions {
  /** Callback when weight value changes */
  onWeightChange: (value: number | null) => void;
  /** Callback when reps value changes */
  onRepsChange: (value: number | null) => void;
  /** Callback when RPE value changes (optional - if not provided, RPE input is hidden) */
  onRpeChange?: (value: number | null) => void;
  /** Callback when complete button is clicked */
  onComplete: () => void;
  /** Callback when delete button is clicked (optional - if not provided, delete button is hidden) */
  onDelete?: () => void;
}

export interface SetRowCardProps {
  /** Set data including number, values, and state */
  data: SetData;
  /** Action callbacks for user interactions */
  actions: SetActions;
  /** Previous set data for reference display */
  previousSet?: PreviousSet;
  /** Whether all inputs and actions should be disabled */
  disabled?: boolean;
}
