/**
 * WeightGoalForm - Form for creating weight-based goals
 */

import { NumberInput, Select, SimpleGrid, Stack, Textarea, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { DIRECTION_OPTIONS, WEIGHT_UNIT_OPTIONS } from "./constants";
import type { Direction, WeightUnit } from "./constants";

export interface WeightGoalFormValues {
  title: string;
  description: string;
  startWeight: number | string;
  targetWeight: number | string;
  weightUnit: WeightUnit;
  direction: Direction;
  targetDate: Date | null;
}

interface WeightGoalFormProps {
  values: WeightGoalFormValues;
  onChange: <K extends keyof WeightGoalFormValues>(
    field: K,
    value: WeightGoalFormValues[K],
  ) => void;
}

export function WeightGoalForm({ values, onChange }: WeightGoalFormProps) {
  return (
    <Stack gap="md">
      <TextInput
        label="Goal Title"
        placeholder="e.g., Lose 5kg by summer"
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
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <NumberInput
          label="Starting Weight"
          placeholder="Current weight"
          value={values.startWeight}
          onChange={(val) => onChange("startWeight", val)}
          min={0}
          required
        />
        <NumberInput
          label="Target Weight"
          placeholder="Goal weight"
          value={values.targetWeight}
          onChange={(val) => onChange("targetWeight", val)}
          min={0}
          required
        />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Select
          label="Unit"
          data={WEIGHT_UNIT_OPTIONS as unknown as { value: string; label: string }[]}
          value={values.weightUnit}
          onChange={(value) => onChange("weightUnit", (value as WeightUnit) ?? "kg")}
        />
        <Select
          label="Direction"
          data={DIRECTION_OPTIONS as unknown as { value: string; label: string }[]}
          value={values.direction}
          onChange={(value) => onChange("direction", (value as Direction) ?? "decrease")}
        />
      </SimpleGrid>
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

export function isWeightFormValid(values: WeightGoalFormValues): boolean {
  return (
    values.title.trim().length > 0 &&
    typeof values.startWeight === "number" &&
    typeof values.targetWeight === "number"
  );
}
