/**
 * CheckInForm - Daily check-in form with componentized sections
 * Uses Mantine hooks: useToggle for expandable sections
 */

import { useState } from "react";
import { Button, Stack } from "@mantine/core";
import type { CheckInData, CheckInFormProps, Mood } from "./types";
import { SleepSection } from "./sleep-section";
import { EnergyMoodSection } from "./energy-mood-section";
import { PhysicalSection } from "./physical-section";
import { NutritionSection } from "./nutrition-section";
import { AdvancedSection } from "./advanced-section";
import { NotesSection } from "./notes-section";

export function CheckInForm({ initialData, onSubmit, isLoading = false }: CheckInFormProps) {
  const [formData, setFormData] = useState<CheckInData>({
    sleepHours: initialData?.sleepHours ?? 7,
    sleepQuality: initialData?.sleepQuality ?? 3,
    energyLevel: initialData?.energyLevel ?? 5,
    stressLevel: initialData?.stressLevel ?? 5,
    sorenessLevel: initialData?.sorenessLevel ?? 3,
    soreAreas: initialData?.soreAreas ?? [],
    restingHeartRate: initialData?.restingHeartRate,
    hrvScore: initialData?.hrvScore,
    motivationLevel: initialData?.motivationLevel ?? 5,
    mood: initialData?.mood,
    nutritionQuality: initialData?.nutritionQuality ?? 3,
    hydrationLevel: initialData?.hydrationLevel ?? 3,
    notes: initialData?.notes ?? "",
  });

  const hasAdvancedData = !!(initialData?.restingHeartRate || initialData?.hrvScore);

  const updateField = <K extends keyof CheckInData>(field: K, value: CheckInData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSoreArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      soreAreas: prev.soreAreas?.includes(area)
        ? prev.soreAreas.filter((a) => a !== area)
        : [...(prev.soreAreas ?? []), area],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="lg">
        <SleepSection
          sleepHours={formData.sleepHours ?? 7}
          sleepQuality={formData.sleepQuality ?? 3}
          onSleepHoursChange={(value) => updateField("sleepHours", value)}
          onSleepQualityChange={(value) => updateField("sleepQuality", value)}
        />

        <EnergyMoodSection
          energyLevel={formData.energyLevel ?? 5}
          motivationLevel={formData.motivationLevel ?? 5}
          mood={formData.mood}
          onEnergyChange={(value) => updateField("energyLevel", value)}
          onMotivationChange={(value) => updateField("motivationLevel", value)}
          onMoodChange={(value: Mood) => updateField("mood", value)}
        />

        <PhysicalSection
          sorenessLevel={formData.sorenessLevel ?? 3}
          stressLevel={formData.stressLevel ?? 5}
          soreAreas={formData.soreAreas ?? []}
          onSorenessChange={(value) => updateField("sorenessLevel", value)}
          onStressChange={(value) => updateField("stressLevel", value)}
          onToggleSoreArea={toggleSoreArea}
        />

        <NutritionSection
          nutritionQuality={formData.nutritionQuality ?? 3}
          hydrationLevel={formData.hydrationLevel ?? 3}
          onNutritionChange={(value) => updateField("nutritionQuality", value)}
          onHydrationChange={(value) => updateField("hydrationLevel", value)}
        />

        <AdvancedSection
          restingHeartRate={formData.restingHeartRate}
          hrvScore={formData.hrvScore}
          onRestingHeartRateChange={(value) => updateField("restingHeartRate", value)}
          onHrvScoreChange={(value) => updateField("hrvScore", value)}
          defaultExpanded={hasAdvancedData}
        />

        <NotesSection
          notes={formData.notes ?? ""}
          onNotesChange={(value) => updateField("notes", value)}
        />

        <Button type="submit" loading={isLoading} fullWidth>
          {isLoading ? "Saving..." : "Save Check-in"}
        </Button>
      </Stack>
    </form>
  );
}
