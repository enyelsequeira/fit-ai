export type RecordTypeFilter =
  | "all"
  | "one_rep_max"
  | "max_weight"
  | "max_reps"
  | "max_volume"
  | "best_time"
  | "longest_duration"
  | "longest_distance";

export const RECORD_TYPE_LABELS: Record<RecordTypeFilter, string> = {
  all: "All Types",
  one_rep_max: "Est. 1RM",
  max_weight: "Max Weight",
  max_reps: "Max Reps",
  max_volume: "Max Volume",
  best_time: "Best Time",
  longest_duration: "Duration",
  longest_distance: "Distance",
};

export const RECORD_TYPE_COLORS: Record<string, string> = {
  one_rep_max: "violet",
  max_weight: "blue",
  max_reps: "green",
  max_volume: "orange",
  best_time: "red",
  longest_duration: "cyan",
  longest_distance: "pink",
};

export interface PersonalRecordItem {
  id: number;
  exerciseId: number;
  recordType: string;
  value: number;
  displayUnit: string | null;
  achievedAt: Date;
  exercise?: {
    id: number;
    name: string;
    category: string;
    exerciseType: string;
  };
}

export interface RecordsByExerciseGroup {
  exerciseId: number;
  exerciseName: string;
  exerciseCategory: string;
  records: PersonalRecordItem[];
  hasRecentPR: boolean;
}
