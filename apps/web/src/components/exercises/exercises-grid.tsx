/**
 * ExercisesGrid - Grid layout for exercise cards
 */

import type { ExerciseItem } from "./exercise-card";

import { useCallback } from "react";
import { Box, Card, Flex, Group, SimpleGrid, Skeleton, Stack } from "@mantine/core";

import { ExerciseGridCard } from "./exercise-card";

// Re-export ExerciseItem for backwards compatibility
export type { ExerciseItem } from "./exercise-card";

interface ExercisesGridProps {
  exercises: ExerciseItem[];
  isLoading: boolean;
  onExerciseClick: (exerciseId: number) => void;
}

export function ExercisesGrid({ exercises, isLoading, onExerciseClick }: ExercisesGridProps) {
  const handleExerciseClick = useCallback(
    (exerciseId: number) => {
      onExerciseClick(exerciseId);
    },
    [onExerciseClick],
  );

  if (isLoading) {
    return <ExercisesGridSkeleton />;
  }

  if (exercises.length === 0) {
    return null;
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
      {exercises.map((exercise) => (
        <ExerciseGridCard key={exercise.id} exercise={exercise} onClick={handleExerciseClick} />
      ))}
    </SimpleGrid>
  );
}

function ExercisesGridSkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} padding={0} radius="md" withBorder>
          <Skeleton h={128} w="100%" radius={0} />
          <Box p="md" pb="xs">
            <Flex justify="space-between" align="flex-start" gap="xs">
              <Skeleton h={16} w={128} radius="sm" />
              <Skeleton h={32} w={32} radius="xl" />
            </Flex>
          </Box>
          <Stack gap="sm" p="md" pt={0}>
            <Group gap="xs">
              <Skeleton h={20} w={64} radius="sm" />
              <Skeleton h={20} w={80} radius="sm" />
            </Group>
            <Group gap={4}>
              <Skeleton h={16} w={64} radius="sm" />
              <Skeleton h={16} w={80} radius="sm" />
            </Group>
            <Skeleton h={32} w="100%" radius="sm" />
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}
