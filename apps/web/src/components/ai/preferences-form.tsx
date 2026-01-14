import { useState } from "react";

import { Stack } from "@mantine/core";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";

import { getInitialFormData } from "./preferences-form.defaults";
import type { PreferencesData, PreferencesFormProps } from "./preferences-form.types";
import {
  EquipmentSection,
  GoalsSection,
  LimitationsSection,
  ScheduleSection,
  WorkoutPreferencesSection,
} from "./sections";

function PreferencesForm({ initialData, onSubmit, isLoading = false }: PreferencesFormProps) {
  const [formData, setFormData] = useState<PreferencesData>(() => getInitialFormData(initialData));

  const handleChange = (updates: Partial<PreferencesData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <GoalsSection data={formData} onChange={handleChange} />
        <ScheduleSection data={formData} onChange={handleChange} />
        <EquipmentSection data={formData} onChange={handleChange} />
        <WorkoutPreferencesSection data={formData} onChange={handleChange} />
        <LimitationsSection data={formData} onChange={handleChange} />

        <FitAiButton type="submit" disabled={isLoading} fullWidth>
          {isLoading ? "Saving..." : "Save Preferences"}
        </FitAiButton>
      </Stack>
    </form>
  );
}

export { PreferencesForm };
export type { PreferencesData } from "./preferences-form.types";
