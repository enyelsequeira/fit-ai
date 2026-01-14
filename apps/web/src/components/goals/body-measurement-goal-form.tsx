/**
 * BodyMeasurementGoalForm - Form for creating body measurement goals
 */

import { NumberInput, Select, SimpleGrid, Stack, Textarea, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { DIRECTION_OPTIONS, LENGTH_UNIT_OPTIONS, MEASUREMENT_TYPE_OPTIONS } from "./constants";
import type { Direction, LengthUnit } from "./constants";

export interface BodyMeasurementGoalFormValues {
  title: string;
  description: string;
  measurementType: string | null;
  startMeasurement: number | string;
  targetMeasurement: number | string;
  lengthUnit: LengthUnit;
  direction: Direction;
  targetDate: Date | null;
}

interface BodyMeasurementGoalFormProps {
  values: BodyMeasurementGoalFormValues;
  onChange: <K extends keyof BodyMeasurementGoalFormValues>(
    field: K,
    value: BodyMeasurementGoalFormValues[K],
  ) => void;
}

export function BodyMeasurementGoalForm({ values, onChange }: BodyMeasurementGoalFormProps) {
  return (
    <Stack gap="md">
      <TextInput
        label="Goal Title"
        placeholder="e.g., Reduce waist to 32 inches"
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
      <Select
        label="Measurement Type"
        data={MEASUREMENT_TYPE_OPTIONS as unknown as { value: string; label: string }[]}
        value={values.measurementType}
        onChange={(val) => onChange("measurementType", val)}
        required
        searchable
      />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <NumberInput
          label="Starting Measurement"
          placeholder="Current value"
          value={values.startMeasurement}
          onChange={(val) => onChange("startMeasurement", val)}
          min={0}
          required
        />
        <NumberInput
          label="Target Measurement"
          placeholder="Goal value"
          value={values.targetMeasurement}
          onChange={(val) => onChange("targetMeasurement", val)}
          min={0}
          required
        />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Select
          label="Unit"
          data={LENGTH_UNIT_OPTIONS as unknown as { value: string; label: string }[]}
          value={values.lengthUnit}
          onChange={(value) => onChange("lengthUnit", (value as LengthUnit) ?? "cm")}
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

export function isBodyMeasurementFormValid(values: BodyMeasurementGoalFormValues): boolean {
  return (
    values.title.trim().length > 0 &&
    values.measurementType !== null &&
    typeof values.startMeasurement === "number" &&
    typeof values.targetMeasurement === "number"
  );
}
