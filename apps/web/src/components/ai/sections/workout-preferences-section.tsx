import { FormSection, FormSelect } from "../form-fields";
import type { PreferencesData, WorkoutSplit } from "../preferences-form.types";
import { WORKOUT_SPLITS } from "../preferences-form.types";

interface WorkoutPreferencesSectionProps {
  data: PreferencesData;
  onChange: (updates: Partial<PreferencesData>) => void;
}

export function WorkoutPreferencesSection({ data, onChange }: WorkoutPreferencesSectionProps) {
  return (
    <FormSection title="Workout Preferences">
      <FormSelect<WorkoutSplit>
        label="Preferred Split"
        value={data.preferredSplit}
        onChange={(value) => onChange({ preferredSplit: value })}
        options={WORKOUT_SPLITS}
        placeholder="No preference"
      />
    </FormSection>
  );
}
