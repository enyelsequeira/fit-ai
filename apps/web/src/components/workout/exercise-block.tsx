import {
  IconChevronDown,
  IconChevronUp,
  IconDotsVertical,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";

import { RestTimer } from "./rest-timer";
import type { SetType } from "./set-row";
import { SetRow } from "./set-row";
import { SimplePreviousPerformance } from "./previous-performance";

interface ExerciseSet {
  id: number | string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  setType: SetType;
  isCompleted: boolean;
  targetWeight?: number | null;
  targetReps?: number | null;
}

interface Exercise {
  id: number;
  name: string;
  category: string;
  muscleGroups?: string[];
  equipment?: string | null;
}

interface PreviousPerformance {
  topSet: { weight: number; reps: number } | null;
  sets: Array<{
    setNumber: number;
    weight: number | null;
    reps: number | null;
    rpe: number | null;
  }>;
}

interface ExerciseBlockProps {
  workoutExerciseId: number;
  exercise: Exercise;
  sets: ExerciseSet[];
  previousPerformance?: PreviousPerformance | null;
  supersetGroupId?: number | null;
  notes?: string | null;
  isExpanded?: boolean;
  showRestTimer?: boolean;
  restTimerSeconds?: number;
  weightUnit?: "kg" | "lb";
  onAddSet: () => void;
  onUpdateSet: (setId: number | string, data: Partial<ExerciseSet>) => void;
  onDeleteSet: (setId: number | string) => void;
  onCompleteSet: (setId: number | string) => void;
  onRemoveExercise: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  className?: string;
}

function ExerciseBlock({
  workoutExerciseId: _workoutExerciseId,
  exercise,
  sets,
  previousPerformance,
  supersetGroupId,
  notes,
  isExpanded: defaultExpanded = true,
  showRestTimer = false,
  restTimerSeconds = 90,
  weightUnit = "kg",
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onCompleteSet,
  onRemoveExercise,
  onMoveUp,
  onMoveDown,
}: ExerciseBlockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeRestTimer, setActiveRestTimer] = useState(false);

  const completedSets = sets.filter((s) => s.isCompleted).length;
  const totalSets = sets.length;

  const handleCompleteSet = (setId: number | string) => {
    onCompleteSet(setId);
    setActiveRestTimer(true);
  };

  return (
    <Box
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderLeft: supersetGroupId ? "4px solid var(--mantine-color-blue-5)" : undefined,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        gap="xs"
        px="sm"
        py="xs"
        style={{
          backgroundColor: "var(--mantine-color-default-hover)",
          cursor: "pointer",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Group gap="xs" style={{ minWidth: 0 }}>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <IconChevronUp style={{ width: 16, height: 16 }} />
            ) : (
              <IconChevronDown style={{ width: 16, height: 16 }} />
            )}
          </ActionIcon>

          <Box style={{ minWidth: 0 }}>
            <Group gap="xs">
              <Text fz="sm" fw={500} truncate>
                {exercise.name}
              </Text>
              {supersetGroupId && (
                <Badge variant="outline" size="xs">
                  Superset
                </Badge>
              )}
            </Group>
            <Group gap="xs">
              <Text fz="xs" c="dimmed" tt="capitalize">
                {exercise.category}
              </Text>
              {exercise.equipment && (
                <>
                  <Text fz="xs" c="dimmed">
                    -
                  </Text>
                  <Text fz="xs" c="dimmed">
                    {exercise.equipment}
                  </Text>
                </>
              )}
            </Group>
          </Box>
        </Group>

        <Group gap="xs">
          <Badge color={completedSets === totalSets ? "green" : "gray"} variant="light" size="xs">
            {completedSets}/{totalSets}
          </Badge>

          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm" onClick={(e) => e.stopPropagation()}>
                <IconDotsVertical style={{ width: 16, height: 16 }} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {onMoveUp && (
                <Menu.Item
                  onClick={onMoveUp}
                  leftSection={<IconChevronUp style={{ width: 16, height: 16 }} />}
                >
                  Move Up
                </Menu.Item>
              )}
              {onMoveDown && (
                <Menu.Item
                  onClick={onMoveDown}
                  leftSection={<IconChevronDown style={{ width: 16, height: 16 }} />}
                >
                  Move Down
                </Menu.Item>
              )}
              {(onMoveUp || onMoveDown) && <Menu.Divider />}
              <Menu.Item
                onClick={onRemoveExercise}
                color="red"
                leftSection={<IconTrash style={{ width: 16, height: 16 }} />}
              >
                Remove Exercise
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Flex>

      {/* Content */}
      {isExpanded && (
        <Box p="sm">
          {/* Previous Performance */}
          {previousPerformance?.topSet && (
            <Box mb="sm">
              <SimplePreviousPerformance
                lastWeight={previousPerformance.topSet.weight}
                lastReps={previousPerformance.topSet.reps}
                lastRpe={previousPerformance.sets[0]?.rpe}
              />
            </Box>
          )}

          {/* Notes */}
          {notes && (
            <Text
              fz="xs"
              c="dimmed"
              px="xs"
              py={4}
              mb="sm"
              style={{ backgroundColor: "var(--mantine-color-default-hover)" }}
            >
              {notes}
            </Text>
          )}

          {/* Sets Header */}
          <Box
            px={4}
            pb="xs"
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr 1fr auto auto",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Text fz="xs" c="dimmed" fw={500} style={{ minWidth: 60 }}>
              Set
            </Text>
            <Text fz="xs" c="dimmed" fw={500} ta="center" style={{ minWidth: 70 }}>
              Previous
            </Text>
            <Text fz="xs" c="dimmed" fw={500} ta="center">
              {weightUnit.toUpperCase()}
            </Text>
            <Text fz="xs" c="dimmed" fw={500} ta="center">
              Reps
            </Text>
            <Box style={{ minWidth: 100 }} />
          </Box>

          {/* Sets */}
          <Stack gap={0}>
            {sets.map((set) => {
              const prevSet = previousPerformance?.sets.find((s) => s.setNumber === set.setNumber);
              return (
                <SetRow
                  key={set.id}
                  setNumber={set.setNumber}
                  weight={set.weight}
                  reps={set.reps}
                  rpe={set.rpe}
                  setType={set.setType}
                  isCompleted={set.isCompleted ?? false}
                  previousWeight={prevSet?.weight ?? set.targetWeight}
                  previousReps={prevSet?.reps ?? set.targetReps}
                  weightUnit={weightUnit}
                  onWeightChange={(value) => onUpdateSet(set.id, { weight: value })}
                  onRepsChange={(value) => onUpdateSet(set.id, { reps: value })}
                  onRpeChange={(value) => onUpdateSet(set.id, { rpe: value })}
                  onSetTypeChange={(value) => onUpdateSet(set.id, { setType: value })}
                  onComplete={() => handleCompleteSet(set.id)}
                  onDelete={() => onDeleteSet(set.id)}
                />
              );
            })}
          </Stack>

          {/* Add Set Button */}
          <Button
            variant="subtle"
            size="sm"
            fullWidth
            mt="xs"
            c="dimmed"
            onClick={onAddSet}
            leftSection={<IconPlus style={{ width: 16, height: 16 }} />}
          >
            Add Set
          </Button>

          {/* Rest Timer */}
          {showRestTimer && activeRestTimer && (
            <Box
              mt="sm"
              pt="sm"
              style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
            >
              <Flex justify="center">
                <RestTimer
                  defaultSeconds={restTimerSeconds}
                  autoStart
                  onComplete={() => setActiveRestTimer(false)}
                />
              </Flex>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export { ExerciseBlock };
export type { ExerciseSet, Exercise, PreviousPerformance };
