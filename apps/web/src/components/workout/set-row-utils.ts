export type SetType = "normal" | "warmup" | "failure" | "drop";

export type WeightUnit = "kg" | "lb";

export const SET_TYPE_LABELS: Record<SetType, string> = {
  normal: "Working",
  warmup: "Warmup",
  failure: "Failure",
  drop: "Drop",
};

export const SET_TYPE_COLORS: Record<SetType, string> = {
  normal: "",
  warmup: "var(--mantine-color-yellow-5)",
  failure: "var(--mantine-color-red-5)",
  drop: "var(--mantine-color-blue-5)",
};

export const SET_TYPE_MANTINE_COLORS: Record<SetType, string | undefined> = {
  normal: undefined,
  warmup: "yellow",
  failure: "red",
  drop: "blue",
};

export const RPE_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((v) => ({
  value: v.toString(),
  label: v.toString(),
}));

export function getSetTypeSelectData() {
  return Object.entries(SET_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
}

export function calculateIncrement(currentValue: number | null, increment: number): number {
  return Math.max(0, (currentValue ?? 0) + increment);
}

export function formatPreviousPerformance(
  weight: number | null | undefined,
  reps: number | null | undefined,
  weightUnit: WeightUnit,
  compact = false,
): string | null {
  if (!weight || !reps) return null;
  return compact ? `${weight}x${reps}` : `${weight}${weightUnit} x ${reps}`;
}
