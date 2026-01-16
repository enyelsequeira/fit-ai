/**
 * StrengthGoalForm - Form for creating strength-based goals
 */

import { NumberInput, Select, SimpleGrid, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { WEIGHT_UNIT_OPTIONS } from "./constants";
import type { WeightUnit } from "./constants";

export interface StrengthGoalFormValues {
  title: string;
  description: string;
  exerciseId: number | string;
  startLiftWeight: number | string;
  targetLiftWeight: number | string;
  startReps: number | string;
  targetReps: number | string;
  weightUnit: WeightUnit;
  targetDate: Date | null;
}

interface StrengthGoalFormProps {
  values: StrengthGoalFormValues;
  onChange: <K extends keyof StrengthGoalFormValues>(
    field: K,
    value: StrengthGoalFormValues[K],
  ) => void;
}

export function StrengthGoalForm({ values, onChange }: StrengthGoalFormProps) {
  return (
    <Stack gap="md">
      <TextInput
        label="Goal Title"
        placeholder="e.g., Bench press 100kg"
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
        label="Exercise ID"
        placeholder="Enter exercise ID"
        description="Search and select exercise (feature coming soon)"
        value={values.exerciseId}
        onChange={(val) => onChange("exerciseId", val)}
        min={1}
        required
      />
      <Text size="sm" fw={500}>
        Weight Target (Optional)
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <NumberInput
          label="Starting Weight"
          placeholder="Current best"
          value={values.startLiftWeight}
          onChange={(val) => onChange("startLiftWeight", val)}
          min={0}
        />
        <NumberInput
          label="Target Weight"
          placeholder="Goal weight"
          value={values.targetLiftWeight}
          onChange={(val) => onChange("targetLiftWeight", val)}
          min={0}
        />
      </SimpleGrid>
      <Text size="sm" fw={500}>
        Rep Target (Optional)
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <NumberInput
          label="Starting Reps"
          placeholder="Current best"
          value={values.startReps}
          onChange={(val) => onChange("startReps", val)}
          min={0}
        />
        <NumberInput
          label="Target Reps"
          placeholder="Goal reps"
          value={values.targetReps}
          onChange={(val) => onChange("targetReps", val)}
          min={0}
        />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Select
          label="Weight Unit"
          data={WEIGHT_UNIT_OPTIONS as unknown as { value: string; label: string }[]}
          value={values.weightUnit}
          onChange={(value) => onChange("weightUnit", (value as WeightUnit) ?? "kg")}
        />
        <DatePickerInput
          label="Target Date"
          placeholder="Select deadline"
          value={values.targetDate}
          onChange={(val) => onChange("targetDate", val)}
          clearable
          minDate={new Date()}
        />
      </SimpleGrid>
    </Stack>
  );
}

export function isStrengthFormValid(values: StrengthGoalFormValues): boolean {
  return (
    values.title.trim().length > 0 &&
    typeof values.exerciseId === "number" &&
    (typeof values.targetLiftWeight === "number" || typeof values.targetReps === "number")
  );
}
