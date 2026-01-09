import type { Exercise } from "./exercise-card";

import { ActionIcon, Badge, Box, Flex, Group, Skeleton, Stack, Text } from "@mantine/core";
import { IconChevronRight, IconPlus } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { CategoryBadge } from "./category-badge";
import { EquipmentIcon } from "./equipment-icon";
import { ExerciseImageThumbnail } from "./exercise-image";
import { ExerciseLevelBadge } from "./exercise-level-badge";
import { MuscleGroupTags } from "./muscle-group-selector";

interface ExerciseListProps {
  exercises: Exercise[];
  onAddToWorkout?: (exerciseId: number) => void;
  showAddButton?: boolean;
}

export function ExerciseList({
  exercises,
  onAddToWorkout,
  showAddButton = false,
}: ExerciseListProps) {
  return (
    <Stack gap={0}>
      {exercises.map((exercise) => (
        <ExerciseListItem
          key={exercise.id}
          exercise={exercise}
          onAddToWorkout={onAddToWorkout}
          showAddButton={showAddButton}
        />
      ))}
    </Stack>
  );
}

interface ExerciseListItemProps {
  exercise: Exercise;
  onAddToWorkout?: (exerciseId: number) => void;
  showAddButton?: boolean;
}

function ExerciseListItem({
  exercise,
  onAddToWorkout,
  showAddButton = false,
}: ExerciseListItemProps) {
  return (
    <Flex
      align="center"
      gap="md"
      p="md"
      style={{
        borderBottom: "1px solid var(--mantine-color-default-border)",
        transition: "background-color 150ms ease",
      }}
      className="group"
      styles={{
        root: {
          "&:hover": {
            backgroundColor: "var(--mantine-color-gray-light-hover)",
          },
        },
      }}
    >
      <ExerciseImageThumbnail src={exercise.primaryImage} alt={exercise.name} />

      <Box style={{ flex: 1, minWidth: 0 }}>
        <Group gap="xs">
          <Text
            component={Link}
            to="/exercises/$exerciseId"
            params={{ exerciseId: String(exercise.id) }}
            fz="sm"
            fw={500}
            style={{
              textDecoration: "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            styles={{
              root: {
                "&:hover": {
                  textDecoration: "underline",
                },
              },
            }}
          >
            {exercise.name}
          </Text>
          {exercise.level && <ExerciseLevelBadge level={exercise.level} size="sm" />}
          {!exercise.isDefault && (
            <Badge size="xs" variant="light" color="blue" style={{ flexShrink: 0 }}>
              Custom
            </Badge>
          )}
        </Group>

        <Group gap="xs" mt={4}>
          <CategoryBadge category={exercise.category} size="sm" showIcon={false} />
          {exercise.equipment && (
            <EquipmentIcon equipment={exercise.equipment} showLabel size="sm" />
          )}
        </Group>

        {exercise.muscleGroups.length > 0 && (
          <Box mt="xs">
            <MuscleGroupTags muscles={exercise.muscleGroups} maxVisible={3} size="sm" />
          </Box>
        )}
      </Box>

      <Group gap="xs" style={{ flexShrink: 0 }}>
        {showAddButton && onAddToWorkout && (
          <ActionIcon
            variant="outline"
            size="sm"
            onClick={() => onAddToWorkout(exercise.id)}
            style={{ opacity: 0, transition: "opacity 150ms ease" }}
            className="group-hover-visible"
          >
            <IconPlus size={16} />
          </ActionIcon>
        )}
        <ActionIcon
          component={Link}
          to="/exercises/$exerciseId"
          params={{ exerciseId: String(exercise.id) }}
          variant="subtle"
          color="gray"
        >
          <IconChevronRight size={20} />
        </ActionIcon>
      </Group>
    </Flex>
  );
}

interface ExerciseListSkeletonProps {
  count?: number;
}

export function ExerciseListSkeleton({ count = 5 }: ExerciseListSkeletonProps) {
  return (
    <Stack gap={0}>
      {Array.from({ length: count }).map((_, i) => (
        <Flex
          key={i}
          align="center"
          gap="md"
          p="md"
          style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
        >
          <Skeleton h={48} w={48} radius="md" style={{ flexShrink: 0 }} />
          <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
            <Skeleton h={16} w={128} radius="sm" />
            <Group gap="xs">
              <Skeleton h={20} w={64} radius="sm" />
              <Skeleton h={20} w={80} radius="sm" />
            </Group>
          </Stack>
          <Skeleton h={20} w={20} radius="sm" style={{ flexShrink: 0 }} />
        </Flex>
      ))}
    </Stack>
  );
}
