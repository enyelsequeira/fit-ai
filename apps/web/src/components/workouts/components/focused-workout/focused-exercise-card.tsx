import type { FocusedExerciseCardProps } from "./focused-exercise-card.types";

import { useEffect, useState } from "react";
import { Badge, Box, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { IconPlus, IconTrophy } from "@tabler/icons-react";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";

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
    lastPerformanceSets,
  } = data;

  const historySet = lastPerformanceSets[currentSetIndex] ?? null;

  const { onSetComplete, onAddSet } = actions;

  const [weight, setWeight] = useState<number | null>(null);
  const [reps, setReps] = useState<number | null>(null);
  const [rpe, setRpe] = useState<number | null>(null);

  // useEffect required: Resetting form state when navigating between sets
  // This cannot be derived state because we need local form state that users can edit
  // The currentSet.id change triggers a reset — inputs clear so placeholders (from last
  // workout) are visible. We only restore values if the set was already partially saved.
  useEffect(() => {
    if (currentSet) {
      setWeight(currentSet.weight ?? null);
      setReps(currentSet.reps ?? null);
      setRpe(currentSet.rpe ?? null);
    } else {
      setWeight(null);
      setReps(null);
      setRpe(null);
    }
    // Only reset when set ID changes (navigating to different set)
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
      {/* Header — exercise name, badges, set counter */}
      <Box className={styles.header}>
        <Text className={styles.exerciseName} fw={800} lh={1.15}>
          {exerciseName}
        </Text>

        <Group justify="space-between" align="center" mt="sm" wrap="wrap" gap="xs">
          <Group gap={6}>
            {exerciseCategory && (
              <Badge variant="light" color="teal" size="xs" radius="sm">
                {exerciseCategory}
              </Badge>
            )}
            {exerciseEquipment && (
              <Badge variant="dot" color="gray" size="xs" radius="sm">
                {exerciseEquipment}
              </Badge>
            )}
          </Group>

          <Text size="sm" fw={700} c="teal" className={styles.setCounter}>
            {completedSets.length} / {totalSets}
          </Text>
        </Group>
      </Box>

      {/* Active set entry or completion state */}
      <Box className={styles.entrySection}>
        {currentSet ? (
          <SetEntryCard
            data={{
              setNumber: currentSetIndex + 1,
              weight,
              reps,
              rpe,
              previousWeight: previousSet?.weight ?? null,
              previousReps: previousSet?.reps ?? null,
              historyWeight: historySet?.weight ?? null,
              historyReps: historySet?.reps ?? null,
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
          <Stack align="center" gap="xs" py="xl" px="md" className={styles.successCard}>
            <IconTrophy size={36} stroke={1.5} className={styles.successIcon} />
            <Text fw={700} size="lg" className={styles.successText}>
              Exercise Complete!
            </Text>
            <Text size="sm" c="dimmed">
              All {totalSets} set{totalSets !== 1 ? "s" : ""} finished
            </Text>
          </Stack>
        ) : null}
      </Box>

      {/* Completed sets history */}
      {hasCompletedSets && (
        <Box className={styles.completedSection}>
          <Group gap="xs" mb="xs">
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" className={styles.completedLabel}>
              Completed
            </Text>
            <Badge variant="filled" color="teal" size="xs" circle>
              {completedSets.length}
            </Badge>
          </Group>

          <ScrollArea mah={180} type="auto" offsetScrollbars>
            <Stack gap={0}>
              {completedSets.map((set, index) => (
                <CompletedSetChip
                  key={set.id}
                  setNumber={index + 1}
                  weight={set.weight}
                  reps={set.reps}
                />
              ))}
            </Stack>
          </ScrollArea>
        </Box>
      )}

      {/* Add Set action */}
      <Box className={styles.footer}>
        <FitAiButton
          variant="secondary"
          leftSection={<IconPlus size={16} />}
          onClick={onAddSet}
          disabled={isLoading}
          fullWidth
        >
          Add Set
        </FitAiButton>
      </Box>
    </Box>
  );
}
