import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

import { ActionIcon, Badge, Box, Flex, Group, Text } from "@mantine/core";

import type { Exercise } from "./exercise-block.types";
import { ExerciseBlockActions } from "./exercise-block-actions";

interface ExerciseBlockHeaderProps {
  exercise: Exercise;
  completedSets: number;
  totalSets: number;
  supersetGroupId?: number | null;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemoveExercise: () => void;
}

function ExerciseBlockHeader({
  exercise,
  completedSets,
  totalSets,
  supersetGroupId,
  isExpanded,
  onToggleExpanded,
  onMoveUp,
  onMoveDown,
  onRemoveExercise,
}: ExerciseBlockHeaderProps) {
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpanded();
  };

  return (
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
      onClick={onToggleExpanded}
    >
      <Group gap="xs" style={{ minWidth: 0 }}>
        <ActionIcon variant="subtle" size="sm" onClick={handleToggleClick}>
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

        <ExerciseBlockActions
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRemoveExercise={onRemoveExercise}
        />
      </Group>
    </Flex>
  );
}

export { ExerciseBlockHeader };
