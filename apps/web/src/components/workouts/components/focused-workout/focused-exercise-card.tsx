import { useEffect, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { Badge, Box, ScrollArea, Stack } from "@mantine/core";

import type { FocusedExerciseCardProps } from "./focused-exercise-card.types";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import { CompletedSetChip } from "./completed-set-chip";
import { SetEntryCard } from "./set-entry-card";
import styles from "./focused-exercise-card.module.css";

export function FocusedExerciseCard({
  data,
  actions,
  isLoading = false,
}: FocusedExerciseCardProps) {
  const {
    exerciseName,
    exerciseCategory,
    exerciseEquipment,
    currentSetIndex,
    totalSets,
    completedSets,
    currentSet,
    previousSet,
  } = data;

  const { onSetComplete, onAddSet } = actions;

  const [weight, setWeight] = useState<number | null>(null);
  const [reps, setReps] = useState<number | null>(null);
  const [rpe, setRpe] = useState<number | null>(null);

  // useEffect required: Resetting form state when navigating between sets
  // This cannot be derived state because we need local form state that users can edit
  // The currentSet.id change triggers a reset to pre-fill values from previous workout
  useEffect(() => {
    if (currentSet) {
      // Use current set values, or fall back to previous set values
      const weightValue = currentSet.weight ?? previousSet?.weight ?? null;
      const repsValue = currentSet.reps ?? previousSet?.reps ?? null;
      setWeight(weightValue);
      setReps(repsValue);
      setRpe(currentSet.rpe ?? null);
    } else {
      setWeight(null);
      setReps(null);
      setRpe(null);
    }
    // Only reset when set ID changes (navigating to different set)
    // previousSet values are intentionally excluded to avoid re-renders during editing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSet?.id]);

  const handleComplete = () => {
    if (weight !== null && reps !== null) {
      onSetComplete(weight, reps, rpe ?? undefined);
    }
  };

  const allSetsCompleted = !currentSet && completedSets.length === totalSets;
  const hasCompletedSets = completedSets.length > 0;

  return (
    <Box className={styles.card}>
      <div className={styles.exerciseHeader}>
        <FitAiText.Heading className={styles.exerciseName}>{exerciseName}</FitAiText.Heading>
        <div className={styles.badges}>
          {exerciseCategory && (
            <Badge variant="light" color="teal" className={styles.badge}>
              {exerciseCategory}
            </Badge>
          )}
          {exerciseEquipment && (
            <Badge variant="outline" color="gray" className={styles.badge}>
              {exerciseEquipment}
            </Badge>
          )}
        </div>
      </div>

      <div className={styles.setEntry}>
        {currentSet ? (
          <SetEntryCard
            data={{
              setNumber: currentSetIndex + 1,
              weight,
              reps,
              rpe,
              previousWeight: previousSet?.weight ?? null,
              previousReps: previousSet?.reps ?? null,
            }}
            actions={{
              onWeightChange: setWeight,
              onRepsChange: setReps,
              onRpeChange: setRpe,
              onComplete: handleComplete,
            }}
            isLoading={isLoading}
          />
        ) : allSetsCompleted ? (
          <Stack align="center" justify="center" gap="md" py="xl">
            <FitAiText.Heading className={styles.successText}>
              All sets completed!
            </FitAiText.Heading>
            <FitAiText.Caption>
              {totalSets} sets finished for {exerciseName}
            </FitAiText.Caption>
          </Stack>
        ) : null}
      </div>

      {hasCompletedSets && (
        <div className={styles.completedSets}>
          <FitAiText.Label className={styles.completedLabel}>Completed Sets</FitAiText.Label>
          <ScrollArea scrollbarSize={4} type="scroll">
            <div className={styles.completedSetsScroll}>
              {completedSets.map((set, index) => (
                <CompletedSetChip
                  key={set.id}
                  setNumber={index + 1}
                  weight={set.weight}
                  reps={set.reps}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <FitAiButton
        className={styles.addSetButton}
        variant="secondary"
        leftSection={<IconPlus size={18} />}
        onClick={onAddSet}
        disabled={isLoading}
      >
        Add Set
      </FitAiButton>
    </Box>
  );
}
