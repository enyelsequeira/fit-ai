/**
 * CustomGoalForm - Form for creating custom goals
 */

import { NumberInput, Select, SimpleGrid, Stack, Textarea, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { DIRECTION_OPTIONS } from "./constants";
import type { Direction } from "./constants";

export interface CustomGoalFormValues {
  title: string;
  description: string;
  customMetricName: string;
  customMetricUnit: string;
  startCustomValue: number | string;
  targetCustomValue: number | string;
  direction: Direction;
  targetDate: Date | null;
}

interface CustomGoalFormProps {
  values: CustomGoalFormValues;
  onChange: <K extends keyof CustomGoalFormValues>(
    field: K,
    value: CustomGoalFormValues[K],
  ) => void;
}

export function CustomGoalForm({ values, onChange }: CustomGoalFormProps) {
  return (
    <Stack gap="md">
      <TextInput
        label="Goal Title"
        placeholder="e.g., Run 5km in under 25 minutes"
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
        <TextInput
          label="Metric Name"
          placeholder="e.g., Running Time, Distance"
          value={values.customMetricName}
          onChange={(e) => onChange("customMetricName", e.target.value)}
          required
        />
        <TextInput
          label="Unit (Optional)"
          placeholder="e.g., minutes, km"
          value={values.customMetricUnit}
          onChange={(e) => onChange("customMetricUnit", e.target.value)}
        />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <NumberInput
          label="Starting Value"
          placeholder="Current value"
          value={values.startCustomValue}
          onChange={(val) => onChange("startCustomValue", val)}
          required
        />
        <NumberInput
          label="Target Value"
          placeholder="Goal value"
          value={values.targetCustomValue}
          onChange={(val) => onChange("targetCustomValue", val)}
          required
        />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Select
          label="Direction"
          data={DIRECTION_OPTIONS as unknown as { value: string; label: string }[]}
          value={values.direction}
          onChange={(value) => onChange("direction", (value as Direction) ?? "increase")}
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

export function isCustomFormValid(values: CustomGoalFormValues): boolean {
  return (
    values.title.trim().length > 0 &&
    values.customMetricName.trim().length > 0 &&
    typeof values.startCustomValue === "number" &&
    typeof values.targetCustomValue === "number"
  );
}
