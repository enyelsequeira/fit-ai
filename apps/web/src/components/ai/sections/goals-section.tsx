import { Stack } from "@mantine/core";

import { FormSection, FormSelect } from "../form-fields";
import type { ExperienceLevel, PreferencesData, TrainingGoal } from "../preferences-form.types";
import { EXPERIENCE_LEVELS, TRAINING_GOALS } from "../preferences-form.types";

interface GoalsSectionProps {
  data: PreferencesData;
  onChange: (updates: Partial<PreferencesData>) => void;
}

export function GoalsSection({ data, onChange }: GoalsSectionProps) {
  return (
    <FormSection title="Training Goals">
      <Stack gap="md">
        <FormSelect<TrainingGoal>
          label="Primary Goal"
          required
          value={data.primaryGoal}
          onChange={(value) => onChange({ primaryGoal: value ?? undefined })}
          options={TRAINING_GOALS}
          placeholder="Select your primary goal"
        />

        <FormSelect<TrainingGoal>
          label="Secondary Goal (optional)"
          value={data.secondaryGoal}
          onChange={(value) => onChange({ secondaryGoal: value })}
          options={TRAINING_GOALS}
          placeholder="Select a secondary goal"
          filterValue={data.primaryGoal}
        />

        <FormSelect<ExperienceLevel>
          label="Experience Level"
          required
          value={data.experienceLevel}
          onChange={(value) => onChange({ experienceLevel: value ?? undefined })}
          options={EXPERIENCE_LEVELS}
          placeholder="Select your experience level"
        />
      </Stack>
    </FormSection>
  );
}
