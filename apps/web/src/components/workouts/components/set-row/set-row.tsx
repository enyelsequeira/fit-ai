/**
 * SetRow - Individual set display and editing component
 * Shows set data with inline editing capability
 */

import { useState, useCallback, useEffect } from "react";
import { ActionIcon, Badge, Box, Group, NumberInput, Text, Tooltip, Menu } from "@mantine/core";
import { IconCheck, IconTrash, IconDotsVertical } from "@tabler/icons-react";
import type { ExerciseSet } from "../../types.ts";
import { useUpdateSet, useDeleteSet, useCompleteSet } from "../../hooks/use-mutations.ts";
import styles from "./set-row.module.css";

interface SetRowProps {
  workoutId: number;
  set: ExerciseSet;
  setIndex: number;
  previousSet?: ExerciseSet;
  isWorkoutCompleted: boolean;
  /** Whether this is the current/next set to complete */
  isCurrent?: boolean;
  /** Callback when set is completed - can be used to trigger rest timer */
  onSetCompleteWithTimer?: (setId: number) => void;
}

export function SetRow({
  workoutId,
  set,
  setIndex,
  previousSet,
  isWorkoutCompleted,
  isCurrent = false,
  onSetCompleteWithTimer,
}: SetRowProps) {
  const updateSetMutation = useUpdateSet(workoutId);
  const deleteSetMutation = useDeleteSet(workoutId);
  const completeSetMutation = useCompleteSet(workoutId);

  // Local state for inline editing
  const [localWeight, setLocalWeight] = useState<number | string>(set.weight ?? "");
  const [localReps, setLocalReps] = useState<number | string>(set.reps ?? "");
  const [localRpe, setLocalRpe] = useState<number | string>(set.rpe ?? "");

  // Sync local state when set data changes
  useEffect(() => {
    setLocalWeight(set.weight ?? "");
    setLocalReps(set.reps ?? "");
    setLocalRpe(set.rpe ?? "");
  }, [set.weight, set.reps, set.rpe]);

  const isCompleted = set.completedAt !== null;

  // Handle field blur to save changes
  const handleSaveWeight = useCallback(() => {
    const weight = localWeight === "" ? null : Number(localWeight);
    if (weight !== set.weight) {
      updateSetMutation.mutate({
        workoutId,
        setId: set.id,
        weight: weight ?? undefined,
      });
    }
  }, [localWeight, set.weight, set.id, workoutId, updateSetMutation]);

  const handleSaveReps = useCallback(() => {
    const reps = localReps === "" ? null : Number(localReps);
    if (reps !== set.reps) {
      updateSetMutation.mutate({
        workoutId,
        setId: set.id,
        reps: reps ?? undefined,
      });
    }
  }, [localReps, set.reps, set.id, workoutId, updateSetMutation]);

  const handleSaveRpe = useCallback(() => {
    const rpe = localRpe === "" ? null : Number(localRpe);
    if (rpe !== set.rpe) {
      updateSetMutation.mutate({
        workoutId,
        setId: set.id,
        rpe: rpe ?? undefined,
      });
    }
  }, [localRpe, set.rpe, set.id, workoutId, updateSetMutation]);

  const handleCompleteSet = useCallback(() => {
    completeSetMutation.mutate(
      {
        workoutId,
        setId: set.id,
      },
      {
        onSuccess: () => {
          // Trigger rest timer callback if provided
          onSetCompleteWithTimer?.(set.id);
        },
      },
    );
  }, [completeSetMutation, workoutId, set.id, onSetCompleteWithTimer]);

  const handleDeleteSet = useCallback(() => {
    if (window.confirm("Are you sure you want to delete this set?")) {
      deleteSetMutation.mutate({
        workoutId,
        setId: set.id,
      });
    }
  }, [deleteSetMutation, workoutId, set.id]);

  // Format previous set info
  const previousSetDisplay = previousSet
    ? `${previousSet.weight ?? "-"}${previousSet.weightUnit === "lb" ? "lb" : "kg"} x ${previousSet.reps ?? "-"}`
    : "-";

  // Determine set type badge
  const getSetTypeBadge = () => {
    if (!set.setType || set.setType === "normal") return null;

    const typeColors: Record<string, string> = {
      warmup: "yellow",
      drop: "orange",
      failure: "red",
    };

    const typeLabels: Record<string, string> = {
      warmup: "W",
      drop: "D",
      failure: "F",
    };

    return (
      <Tooltip label={set.setType.replace("_", " ")} withArrow>
        <Badge size="xs" color={typeColors[set.setType] ?? "gray"} variant="filled">
          {typeLabels[set.setType] ?? set.setType}
        </Badge>
      </Tooltip>
    );
  };

  return (
    <Group
      gap="xs"
      className={styles.setRow}
      data-completed={isCompleted}
      data-current={isCurrent && !isCompleted}
      wrap="nowrap"
    >
      {/* Set Number */}
      <Box w={40} ta="center">
        <Group gap={4} justify="center">
          <Text size="sm" fw={500} c={isCompleted ? "green" : undefined}>
            {setIndex + 1}
          </Text>
          {getSetTypeBadge()}
        </Group>
      </Box>

      {/* Previous Set */}
      <Box w={60} ta="center">
        <Text size="xs" c="dimmed">
          {previousSetDisplay}
        </Text>
      </Box>

      {/* Weight Input */}
      <Box w={70}>
        {isWorkoutCompleted || isCompleted ? (
          <Text size="sm" ta="center">
            {set.weight ?? "-"}
            {set.weight ? (set.weightUnit === "lb" ? "lb" : "kg") : ""}
          </Text>
        ) : (
          <NumberInput
            value={localWeight}
            onChange={setLocalWeight}
            onBlur={handleSaveWeight}
            size="xs"
            min={0}
            step={2.5}
            decimalScale={1}
            hideControls
            placeholder="-"
            classNames={{ input: styles.numberInput }}
            rightSection={
              <Text size="xs" c="dimmed">
                {set.weightUnit === "lb" ? "lb" : "kg"}
              </Text>
            }
            rightSectionWidth={24}
          />
        )}
      </Box>

      {/* Reps Input */}
      <Box w={60}>
        {isWorkoutCompleted || isCompleted ? (
          <Text size="sm" ta="center">
            {set.reps ?? "-"}
          </Text>
        ) : (
          <NumberInput
            value={localReps}
            onChange={setLocalReps}
            onBlur={handleSaveReps}
            size="xs"
            min={0}
            step={1}
            hideControls
            placeholder="-"
            classNames={{ input: styles.numberInput }}
          />
        )}
      </Box>

      {/* RPE Input */}
      <Box w={50}>
        {isWorkoutCompleted || isCompleted ? (
          <Text size="sm" ta="center" c="dimmed">
            {set.rpe ?? "-"}
          </Text>
        ) : (
          <NumberInput
            value={localRpe}
            onChange={setLocalRpe}
            onBlur={handleSaveRpe}
            size="xs"
            min={6}
            max={10}
            step={0.5}
            decimalScale={1}
            hideControls
            placeholder="-"
            classNames={{ input: styles.numberInput }}
          />
        )}
      </Box>

      {/* Actions */}
      {!isWorkoutCompleted && (
        <Box w={80}>
          <Group gap={4} justify="center">
            {isCompleted ? (
              <Badge size="sm" color="green" variant="light" leftSection={<IconCheck size={12} />}>
                Done
              </Badge>
            ) : (
              <>
                <Tooltip label="Complete set" withArrow>
                  <ActionIcon
                    variant="filled"
                    color="green"
                    size="sm"
                    onClick={handleCompleteSet}
                    loading={completeSetMutation.isPending}
                    aria-label="Complete set"
                  >
                    <IconCheck size={14} />
                  </ActionIcon>
                </Tooltip>

                <Menu position="bottom-end" withinPortal>
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Set options">
                      <IconDotsVertical size={14} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={handleDeleteSet}
                    >
                      Delete Set
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            )}
          </Group>
        </Box>
      )}
    </Group>
  );
}
