import type { SetEntryCardProps } from "./set-entry-card.types";

import { Group, NumberInput, Stack, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";

import styles from "./set-entry-card.module.css";

export function SetEntryCard({
  data,
  actions,
  isLoading = false,
  disabled = false,
}: SetEntryCardProps) {
  const { setNumber, weight, reps, previousWeight, previousReps, historyWeight, historyReps } =
    data;
  const { onWeightChange, onRepsChange, onComplete } = actions;

  const displayWeight = historyWeight ?? previousWeight;
  const displayReps = historyReps ?? previousReps;
  const isFromHistory = historyWeight != null;
  const hasPreviousData = displayWeight != null || displayReps != null;

  const canComplete =
    weight != null && weight > 0 && reps != null && reps > 0 && !isLoading && !disabled;

  const handleWeightChange = (val: string | number) => {
    if (val === "" || val === undefined) {
      onWeightChange(null);
      return;
    }
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (!isNaN(num) && num >= 0) onWeightChange(num);
  };

  const handleRepsChange = (val: string | number) => {
    if (val === "" || val === undefined) {
      onRepsChange(null);
      return;
    }
    const num = typeof val === "string" ? parseInt(String(val), 10) : val;
    if (!isNaN(num) && num >= 0) onRepsChange(num);
  };

  return (
    <Stack gap="md" className={styles.card}>
      <Group justify="space-between" align="center">
        <Text fw={700} size="sm" tt="uppercase" c="teal" style={{ letterSpacing: "0.5px" }}>
          SET {setNumber}
        </Text>
        {hasPreviousData && (
          <Text size="xs" c="dimmed">
            {isFromHistory ? "Last session" : "Last"}: {displayWeight}kg × {displayReps}
          </Text>
        )}
      </Group>

      <Group grow gap="md">
        <Stack gap={4} align="center">
          <NumberInput
            value={weight ?? ""}
            onChange={handleWeightChange}
            min={0}
            max={500}
            step={2.5}
            clampBehavior="strict"
            size="lg"
            placeholder={(historyWeight ?? previousWeight)?.toString() ?? "0"}
            disabled={disabled || isLoading}
            aria-label="Weight in kg"
            classNames={{ input: styles.numberInput }}
          />
          <Text size="xs" c="dimmed" fw={500}>
            kg
          </Text>
        </Stack>

        <Stack gap={4} align="center">
          <NumberInput
            value={reps ?? ""}
            onChange={handleRepsChange}
            min={0}
            max={100}
            step={1}
            clampBehavior="strict"
            size="lg"
            placeholder={(historyReps ?? previousReps)?.toString() ?? "0"}
            disabled={disabled || isLoading}
            aria-label="Reps"
            classNames={{ input: styles.numberInput }}
          />
          <Text size="xs" c="dimmed" fw={500}>
            reps
          </Text>
        </Stack>
      </Group>

      <FitAiButton
        variant="success"
        fullWidth
        size="lg"
        disabled={!canComplete}
        loading={isLoading}
        onClick={onComplete}
        className={styles.completeButton}
        leftSection={!isLoading && <IconCheck size={20} />}
      >
        {isLoading ? "COMPLETING..." : "COMPLETE SET"}
      </FitAiButton>
    </Stack>
  );
}
