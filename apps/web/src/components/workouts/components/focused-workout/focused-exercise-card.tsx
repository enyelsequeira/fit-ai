import { useEffect, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { Badge, Box, Button, ScrollArea, Stack, Text } from "@mantine/core";

import type { FocusedExerciseCardProps } from "./focused-exercise-card.types";

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

  // Reset form values when currentSet changes
  // BUG FIX: Pre-fill with previous set values if current set has null values
  // This ensures the Complete button is enabled immediately with pre-filled values
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
  }, [currentSet?.id, previousSet?.weight, previousSet?.reps]);

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
        <Text className={styles.exerciseName}>{exerciseName}</Text>
        <div className={styles.badges}>
          {exerciseCategory && (
            <Badge variant="light" color="blue">
              {exerciseCategory}
            </Badge>
          )}
          {exerciseEquipment && (
            <Badge variant="outline" color="gray">
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
            <Text size="xl" fw={600} c="green">
              All sets completed!
            </Text>
            <Text size="sm" c="dimmed">
              {totalSets} sets finished for {exerciseName}
            </Text>
          </Stack>
        ) : null}
      </div>

      {hasCompletedSets && (
        <div className={styles.completedSets}>
          <Text size="sm" fw={500} mb="xs">
            Completed Sets
          </Text>
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

      <Button
        className={styles.addSetButton}
        variant="light"
        leftSection={<IconPlus size={18} />}
        onClick={onAddSet}
        disabled={isLoading}
      >
        Add Set
      </Button>
    </Box>
  );
}
