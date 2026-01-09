import type { ExerciseCategory } from "./category-badge";
import type { EquipmentType } from "./equipment-icon";
import type { ExerciseForce, ExerciseLevel, ExerciseMechanic } from "./exercise-level-badge";

import { Box, Button, Card, Flex, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { CategoryBadge, categoryConfig } from "./category-badge";
import { EquipmentIcon } from "./equipment-icon";
import { ExerciseImage } from "./exercise-image";
import { ExerciseLevelBadge } from "./exercise-level-badge";
import { MuscleGroupTags } from "./muscle-group-selector";

export interface Exercise {
  id: number;
  name: string;
  description: string | null;
  category: ExerciseCategory;
  muscleGroups: string[];
  equipment: EquipmentType;
  exerciseType: "strength" | "cardio" | "flexibility";
  isDefault: boolean;
  createdByUserId: string | null;
  // New image & metadata fields
  primaryImage?: string | null;
  images?: string[];
  instructions?: string[];
  level?: ExerciseLevel | null;
  force?: ExerciseForce | null;
  mechanic?: ExerciseMechanic | null;
}

interface ExerciseCardProps {
  exercise: Exercise;
  onAddToWorkout?: (exerciseId: number) => void;
  showAddButton?: boolean;
}

export function ExerciseCard({
  exercise,
  onAddToWorkout,
  showAddButton = false,
}: ExerciseCardProps) {
  const config = categoryConfig[exercise.category];

  return (
    <Card
      padding={0}
      radius="md"
      withBorder
      className="group"
      style={{
        transition: "all 200ms ease",
      }}
      styles={{
        root: {
          "&:hover": {
            boxShadow: "var(--mantine-shadow-md)",
          },
        },
      }}
    >
      {/* Exercise Image */}
      <Box
        component={Link}
        to="/exercises/$exerciseId"
        params={{ exerciseId: String(exercise.id) }}
        style={{ display: "block" }}
      >
        <ExerciseImage
          src={exercise.primaryImage}
          alt={exercise.name}
          size="md"
          style={{ width: "100%" }}
        />
      </Box>

      <Box p="md" pb="xs">
        <Flex justify="space-between" align="flex-start" gap="xs">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text
              component={Link}
              to="/exercises/$exerciseId"
              params={{ exerciseId: String(exercise.id) }}
              style={{ textDecoration: "none" }}
              styles={{
                root: {
                  "&:hover": {
                    textDecoration: "underline",
                  },
                },
              }}
            >
              <Title
                order={4}
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {exercise.name}
              </Title>
            </Text>
          </Box>
          <Box
            p={6}
            style={{
              borderRadius: "50%",
              flexShrink: 0,
              backgroundColor: config.bgColor,
            }}
          >
            <config.icon size={16} style={{ color: config.color }} />
          </Box>
        </Flex>
      </Box>

      <Stack gap="sm" p="md" pt={0}>
        <Group gap="xs" wrap="wrap">
          <CategoryBadge category={exercise.category} size="sm" showIcon={false} />
          {exercise.level && <ExerciseLevelBadge level={exercise.level} size="sm" />}
          {exercise.equipment && (
            <EquipmentIcon equipment={exercise.equipment} showLabel size="sm" />
          )}
        </Group>

        {exercise.muscleGroups.length > 0 && (
          <MuscleGroupTags muscles={exercise.muscleGroups} maxVisible={2} size="sm" />
        )}

        {exercise.description && (
          <Text fz="xs" c="dimmed" lineClamp={2}>
            {exercise.description}
          </Text>
        )}

        {showAddButton && onAddToWorkout && (
          <Button
            variant="outline"
            size="xs"
            fullWidth
            leftSection={<IconPlus size={12} />}
            onClick={(e) => {
              e.preventDefault();
              onAddToWorkout(exercise.id);
            }}
            style={{ opacity: 0, transition: "opacity 150ms ease" }}
            className="group-hover-visible"
          >
            Add to Workout
          </Button>
        )}
      </Stack>
    </Card>
  );
}

interface ExerciseCardSkeletonProps {
  className?: string;
}

export function ExerciseCardSkeleton({ className }: ExerciseCardSkeletonProps) {
  return (
    <Card padding={0} radius="md" withBorder className={className}>
      {/* Image skeleton */}
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
  );
}
