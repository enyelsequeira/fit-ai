import { Stack } from "@mantine/core";

import { CheckboxGrid, FormSection, FormTextarea } from "../form-fields";
import type { PreferencesData } from "../preferences-form.types";
import { MUSCLE_GROUPS } from "../preferences-form.types";

interface LimitationsSectionProps {
  data: PreferencesData;
  onChange: (updates: Partial<PreferencesData>) => void;
}

export function LimitationsSection({ data, onChange }: LimitationsSectionProps) {
  return (
    <FormSection title="Limitations & Injuries">
      <Stack gap="md">
        <FormTextarea
          label="Injuries or Limitations"
          value={data.injuries ?? ""}
          onChange={(value) => onChange({ injuries: value })}
          placeholder="Describe any injuries or physical limitations..."
        />

        <CheckboxGrid
          label="Muscle Groups to Avoid"
          options={MUSCLE_GROUPS}
          selectedValues={data.avoidMuscleGroups ?? []}
          onChange={(values) => onChange({ avoidMuscleGroups: values })}
          variant="danger"
        />
      </Stack>
    </FormSection>
  );
}
