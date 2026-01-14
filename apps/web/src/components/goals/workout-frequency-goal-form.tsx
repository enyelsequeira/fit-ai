/**
 * WorkoutFrequencyGoalForm - Form for creating workout frequency goals
 */

import { NumberInput, Stack, Textarea, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

export interface WorkoutFrequencyGoalFormValues {
  title: string;
  description: string;
  targetWorkoutsPerWeek: number | string;
  targetDate: Date | null;
}

interface WorkoutFrequencyGoalFormProps {
  values: WorkoutFrequencyGoalFormValues;
  onChange: <K extends keyof WorkoutFrequencyGoalFormValues>(
    field: K,
    value: WorkoutFrequencyGoalFormValues[K],
  ) => void;
}

export function WorkoutFrequencyGoalForm({ values, onChange }: WorkoutFrequencyGoalFormProps) {
  return (
    <Stack gap="md">
      <TextInput
        label="Goal Title"
        placeholder="e.g., Workout 4 times per week"
        value={values.title}
        onChange={(e) => onChange("title", e.target.value)}
        required
      />
      <Textarea
        label="Description"
        placeholder="Optional notes about your goal"
        value={values.description}
        onChange={(e) => onChange("description", e.target.value)}
        rows={2}
      />
      <NumberInput
        label="Target Workouts Per Week"
        placeholder="e.g., 4"
        value={values.targetWorkoutsPerWeek}
        onChange={(val) => onChange("targetWorkoutsPerWeek", val)}
        min={1}
        max={14}
        required
      />
      <DatePickerInput
        label="Target Date (Optional)"
        placeholder="Select deadline"
        value={values.targetDate}
        onChange={(val) => onChange("targetDate", val)}
        clearable
        minDate={new Date()}
      />
    </Stack>
  );
}

export function isWorkoutFrequencyFormValid(values: WorkoutFrequencyGoalFormValues): boolean {
  return (
    values.title.trim().length > 0 &&
    typeof values.targetWorkoutsPerWeek === "number" &&
    values.targetWorkoutsPerWeek > 0
  );
}
