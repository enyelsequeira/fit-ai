import { Stack } from "@mantine/core";

import { FormSection, FormSelect, FormSlider, ToggleButtonGroup } from "../form-fields";
import type { DayOfWeek, PreferencesData } from "../preferences-form.types";
import { DAYS_OF_WEEK, DURATION_OPTIONS } from "../preferences-form.types";

interface ScheduleSectionProps {
  data: PreferencesData;
  onChange: (updates: Partial<PreferencesData>) => void;
}

export function ScheduleSection({ data, onChange }: ScheduleSectionProps) {
  const durationValue = String(data.preferredWorkoutDuration ?? 60);

  return (
    <FormSection title="Schedule">
      <Stack gap="md">
        <FormSlider
          label="Workout Days Per Week"
          value={data.workoutDaysPerWeek ?? 3}
          onChange={(value) => onChange({ workoutDaysPerWeek: value })}
          min={1}
          max={7}
          valueLabel={`${data.workoutDaysPerWeek ?? 3} days`}
        />

        <FormSelect<string>
          label="Preferred Workout Duration"
          value={durationValue}
          onChange={(value) =>
            onChange({ preferredWorkoutDuration: value ? parseInt(value, 10) : 60 })
          }
          options={DURATION_OPTIONS}
          placeholder="Select duration"
        />

        <ToggleButtonGroup<DayOfWeek>
          label="Preferred Days"
          options={DAYS_OF_WEEK}
          selectedValues={data.preferredDays ?? []}
          onChange={(values) => onChange({ preferredDays: values })}
        />
      </Stack>
    </FormSection>
  );
}
