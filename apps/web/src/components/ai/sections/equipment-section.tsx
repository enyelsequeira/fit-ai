import { Stack } from "@mantine/core";

import { CheckboxGrid, FormSection, FormSelect } from "../form-fields";
import type { PreferencesData, TrainingLocation } from "../preferences-form.types";
import { EQUIPMENT_OPTIONS, TRAINING_LOCATIONS } from "../preferences-form.types";

interface EquipmentSectionProps {
  data: PreferencesData;
  onChange: (updates: Partial<PreferencesData>) => void;
}

export function EquipmentSection({ data, onChange }: EquipmentSectionProps) {
  return (
    <FormSection title="Equipment & Location">
      <Stack gap="md">
        <FormSelect<TrainingLocation>
          label="Training Location"
          value={data.trainingLocation}
          onChange={(value) => onChange({ trainingLocation: value ?? undefined })}
          options={TRAINING_LOCATIONS}
          placeholder="Select location"
        />

        <CheckboxGrid
          label="Available Equipment"
          options={EQUIPMENT_OPTIONS}
          selectedValues={data.availableEquipment ?? []}
          onChange={(values) => onChange({ availableEquipment: values })}
        />
      </Stack>
    </FormSection>
  );
}
