/**
 * LogProgressModal - Quick form to log progress on a goal
 */

import { useEffect, useState } from "react";
import {
  Box,
  Group,
  Modal,
  NumberInput,
  Paper,
  Progress,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import type { GoalWithExercise } from "./types";

/**
 * Get the current value field name based on goal type
 */
function getCurrentValueLabel(goal: GoalWithExercise): string {
  const type = goal.goalType;

  switch (type) {
    case "weight":
      return `Current Weight (${goal.weightUnit ?? "kg"})`;
    case "strength":
      if (goal.targetLiftWeight) {
        return `Current Lift Weight (${goal.weightUnit ?? "kg"})`;
      }
      return "Current Reps";
    case "body_measurement":
      return `Current Measurement (${goal.lengthUnit ?? "cm"})`;
    case "workout_frequency":
      return "Workouts This Week";
    case "custom":
      return `Current Value${goal.customMetricUnit ? ` (${goal.customMetricUnit})` : ""}`;
    default:
      return "Current Value";
  }
}

/**
 * Get the current value from goal based on type
 */
function getCurrentValue(goal: GoalWithExercise): number | null {
  const type = goal.goalType;

  switch (type) {
    case "weight":
      return goal.currentWeight ?? null;
    case "strength":
      if (goal.targetLiftWeight) {
        return goal.currentLiftWeight ?? null;
      }
      return goal.currentReps ?? null;
    case "body_measurement":
      return goal.currentMeasurement ?? null;
    case "workout_frequency":
      return goal.currentWorkoutsPerWeek ?? null;
    case "custom":
      return goal.currentCustomValue ?? null;
    default:
      return null;
  }
}

/**
 * Get the target value from goal based on type
 */
function getTargetValue(goal: GoalWithExercise): number | null {
  const type = goal.goalType;

  switch (type) {
    case "weight":
      return goal.targetWeight ?? null;
    case "strength":
      if (goal.targetLiftWeight) {
        return goal.targetLiftWeight ?? null;
      }
      return goal.targetReps ?? null;
    case "body_measurement":
      return goal.targetMeasurement ?? null;
    case "workout_frequency":
      return goal.targetWorkoutsPerWeek ?? null;
    case "custom":
      return goal.targetCustomValue ?? null;
    default:
      return null;
  }
}

/**
 * Get the unit string for the goal
 */
function getUnit(goal: GoalWithExercise): string {
  const type = goal.goalType;

  switch (type) {
    case "weight":
      return goal.weightUnit ?? "kg";
    case "strength":
      if (goal.targetLiftWeight) {
        return goal.weightUnit ?? "kg";
      }
      return "reps";
    case "body_measurement":
      return goal.lengthUnit ?? "cm";
    case "workout_frequency":
      return "per week";
    case "custom":
      return goal.customMetricUnit ?? "";
    default:
      return "";
  }
}

/**
 * Get the start value for a goal based on its type
 */
function getStartValue(goal: GoalWithExercise): number | null {
  const type = goal.goalType;
  switch (type) {
    case "weight":
      return goal.startWeight ?? null;
    case "strength":
      return goal.targetLiftWeight ? (goal.startLiftWeight ?? null) : (goal.startReps ?? null);
    case "body_measurement":
      return goal.startMeasurement ?? null;
    case "workout_frequency":
      return 0; // Always starts at 0
    case "custom":
      return goal.startCustomValue ?? null;
    default:
      return null;
  }
}

interface LogProgressModalProps {
  opened: boolean;
  onClose: () => void;
  goal: GoalWithExercise | null;
  onSubmit: (data: { goalId: number; value: number; note?: string }) => void;
  isLoading?: boolean;
}

export function LogProgressModal({
  opened,
  onClose,
  goal,
  onSubmit,
  isLoading,
}: LogProgressModalProps) {
  const [value, setValue] = useState<number | string>("");
  const [note, setNote] = useState("");

  // Reset form when modal opens with new goal
  useEffect(() => {
    if (opened && goal) {
      const currentValue = getCurrentValue(goal);
      setValue(currentValue ?? "");
      setNote("");
    }
  }, [opened, goal]);

  const handleClose = () => {
    setValue("");
    setNote("");
    onClose();
  };

  const handleSubmit = () => {
    if (!goal || typeof value !== "number") return;

    // onSubmit (handleLogProgressSubmit) is async and calls closeLogProgressModal on success
    // Do not call handleClose here — let the async handler own the modal lifecycle
    onSubmit({
      goalId: goal.id,
      value,
      note: note.trim() || undefined,
    });
  };

  if (!goal) return null;

  const currentValue = getCurrentValue(goal);
  const targetValue = getTargetValue(goal);
  const unit = getUnit(goal);
  const DirectionIcon = goal.direction === "decrease" ? IconTrendingDown : IconTrendingUp;

  // Calculate preview progress if a value is entered
  let previewProgress = goal.progressPercentage ?? 0;
  if (typeof value === "number" && targetValue !== null) {
    const startValue = getStartValue(goal);
    if (startValue !== null && startValue !== targetValue) {
      if (goal.direction === "decrease") {
        previewProgress = Math.min(
          100,
          Math.max(0, ((startValue - value) / (startValue - targetValue)) * 100),
        );
      } else {
        previewProgress = Math.min(
          100,
          Math.max(0, ((value - startValue) / (targetValue - startValue)) * 100),
        );
      }
      if (!Number.isFinite(previewProgress)) {
        previewProgress = goal.progressPercentage ?? 0;
      }
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Log Progress" size="md">
      <Stack gap="md">
        {/* Goal Info */}
        <Paper p="sm" radius="md" bg="var(--mantine-color-gray-light)">
          <Text fw={600} mb={4}>
            {goal.title}
          </Text>
          <Group gap="xs">
            <DirectionIcon size={14} color="var(--mantine-color-dimmed)" />
            <Text size="sm" c="dimmed">
              Target: {targetValue ?? "-"} {unit}
            </Text>
          </Group>
        </Paper>

        {/* Current Progress */}
        <Box>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed">
              Current Progress
            </Text>
            <Text size="sm" fw={500}>
              {Math.round(goal.progressPercentage ?? 0)}%
            </Text>
          </Group>
          <Progress value={goal.progressPercentage ?? 0} size="sm" radius="xl" color="blue" />
          <Text size="xs" c="dimmed" mt={4}>
            Current: {currentValue ?? "-"} {unit}
          </Text>
        </Box>

        {/* Input */}
        <NumberInput
          label={getCurrentValueLabel(goal)}
          placeholder="Enter new value"
          value={value}
          onChange={setValue}
          min={0}
          required
          description={`Previous: ${currentValue ?? "-"} ${unit}`}
        />

        {/* Preview Progress */}
        {typeof value === "number" && value !== currentValue && (
          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">
                New Progress
              </Text>
              <Text size="sm" fw={500} c="green">
                {Math.round(previewProgress)}%
              </Text>
            </Group>
            <Progress value={previewProgress} size="sm" radius="xl" color="green" />
          </Box>
        )}

        {/* Optional Note */}
        <Textarea
          label="Note (Optional)"
          placeholder="Add a note about this progress update"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />

        {/* Actions */}
        <Group justify="flex-end" mt="md">
          <FitAiButton variant="ghost" onClick={handleClose}>
            Cancel
          </FitAiButton>
          <FitAiButton
            onClick={handleSubmit}
            loading={isLoading}
            disabled={typeof value !== "number"}
          >
            Log Progress
          </FitAiButton>
        </Group>
      </Stack>
    </Modal>
  );
}
