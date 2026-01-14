/**
 * ExercisesList - List/table layout for exercises
 */

import type { ExerciseItem } from "./exercise-card";

import { useCallback } from "react";
import {
  Badge,
  Box,
  Group,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  UnstyledButton,
} from "@mantine/core";

import { CategoryBadge } from "@/components/exercise/category-badge";
import { EquipmentIcon } from "@/components/exercise/equipment-icon";
import { ExerciseLevelBadge } from "@/components/exercise/exercise-level-badge";

import { ExerciseListImage } from "./exercise-card";
import styles from "./exercise-card.module.css";

interface ExercisesListProps {
  exercises: ExerciseItem[];
  isLoading: boolean;
  onExerciseClick: (exerciseId: number) => void;
}

export function ExercisesList({ exercises, isLoading, onExerciseClick }: ExercisesListProps) {
  const handleExerciseClick = useCallback(
    (exerciseId: number) => {
      onExerciseClick(exerciseId);
    },
    [onExerciseClick],
  );

  if (isLoading) {
    return <ExercisesListSkeleton />;
  }

  if (exercises.length === 0) {
    return null;
  }

  return (
    <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
      <Table.ScrollContainer minWidth={600}>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Exercise</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Equipment</Table.Th>
              <Table.Th>Muscle Groups</Table.Th>
              <Table.Th>Level</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {exercises.map((exercise) => (
              <ExerciseListRow
                key={exercise.id}
                exercise={exercise}
                onClick={handleExerciseClick}
              />
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}

interface ExerciseListRowProps {
  exercise: ExerciseItem;
  onClick: (exerciseId: number) => void;
  isLoading?: boolean;
  isSelected?: boolean;
}

function ExerciseListRow({
  exercise,
  onClick,
  isLoading = false,
  isSelected = false,
}: ExerciseListRowProps) {
  const visibleMuscles = exercise.muscleGroups.slice(0, 3);
  const remainingCount = exercise.muscleGroups.length - 3;

  const handleClick = useCallback(() => {
    onClick(exercise.id);
  }, [onClick, exercise.id]);

  return (
    <Table.Tr className={styles.listRow} data-loading={isLoading} data-selected={isSelected}>
      <Table.Td>
        <UnstyledButton onClick={handleClick}>
          <Group gap="sm" wrap="nowrap">
            <ExerciseListImage
              src={exercise.primaryImage}
              alt={exercise.name}
              category={exercise.category}
            />
            <Box>
              <Text fw={500} className={styles.listExerciseName}>
                {exercise.name}
              </Text>
              {exercise.description && (
                <Text fz="xs" c="dimmed" lineClamp={1} maw={200}>
                  {exercise.description}
                </Text>
              )}
            </Box>
          </Group>
        </UnstyledButton>
      </Table.Td>
      <Table.Td>
        <CategoryBadge category={exercise.category} size="sm" />
      </Table.Td>
      <Table.Td>
        {exercise.equipment ? (
          <EquipmentIcon equipment={exercise.equipment} showLabel size="sm" />
        ) : (
          <Text fz="xs" c="dimmed">
            None
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Group gap={4} wrap="wrap">
          {visibleMuscles.map((muscle) => (
            <Badge key={muscle} variant="outline" size="xs" tt="capitalize">
              {muscle}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="outline" size="xs" c="dimmed">
              +{remainingCount}
            </Badge>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        {exercise.level ? (
          <ExerciseLevelBadge level={exercise.level} size="sm" />
        ) : (
          <Text fz="xs" c="dimmed">
            -
          </Text>
        )}
      </Table.Td>
    </Table.Tr>
  );
}

function ExercisesListSkeleton() {
  return (
    <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Exercise</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Equipment</Table.Th>
            <Table.Th>Muscle Groups</Table.Th>
            <Table.Th>Level</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <Table.Tr key={i}>
              <Table.Td>
                <Group gap="sm">
                  <Skeleton w={48} h={48} radius="sm" />
                  <Stack gap={4}>
                    <Skeleton h={14} w={120} radius="sm" />
                    <Skeleton h={10} w={160} radius="sm" />
                  </Stack>
                </Group>
              </Table.Td>
              <Table.Td>
                <Skeleton h={20} w={60} radius="sm" />
              </Table.Td>
              <Table.Td>
                <Skeleton h={16} w={80} radius="sm" />
              </Table.Td>
              <Table.Td>
                <Group gap={4}>
                  <Skeleton h={18} w={50} radius="sm" />
                  <Skeleton h={18} w={50} radius="sm" />
                </Group>
              </Table.Td>
              <Table.Td>
                <Skeleton h={20} w={60} radius="sm" />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
