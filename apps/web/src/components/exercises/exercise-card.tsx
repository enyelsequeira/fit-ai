/**
 * ExerciseCard - Shared card components for exercise display
 * Used by both grid and list views to ensure consistency
 */

import type { ExerciseCategory } from "@/components/exercise/category-badge";
import type { EquipmentType } from "@/components/exercise/equipment-icon";
import type {
  ExerciseForce,
  ExerciseLevel,
  ExerciseMechanic,
} from "@/components/exercise/exercise-level-badge";

import { useCallback } from "react";
import { Badge, Box, Card, Flex, Group, Stack, Text, Title, UnstyledButton } from "@mantine/core";

import { CategoryBadge, categoryConfig } from "@/components/exercise/category-badge";
import { EquipmentIcon } from "@/components/exercise/equipment-icon";
import { ExerciseLevelBadge } from "@/components/exercise/exercise-level-badge";

import styles from "./exercise-card.module.css";

export interface ExerciseItem {
  id: number;
  name: string;
  description: string | null;
  category: ExerciseCategory;
  muscleGroups: string[];
  equipment: EquipmentType;
  exerciseType: "strength" | "cardio" | "flexibility";
  isDefault: boolean;
  createdByUserId: string | null;
  primaryImage?: string | null;
  images?: string[];
  instructions?: string[];
  level?: ExerciseLevel | null;
  force?: ExerciseForce | null;
  mechanic?: ExerciseMechanic | null;
}

interface ExerciseCardImageProps {
  src: string | null | undefined;
  alt: string;
  category: ExerciseCategory;
  size?: "large" | "small";
}

/**
 * Shared image component for exercise cards
 * Displays exercise image or fallback category icon
 */
export function ExerciseCardImage({ src, alt, category, size = "large" }: ExerciseCardImageProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;
  const iconSize = size === "large" ? 32 : 20;

  if (!src) {
    return (
      <Box className={styles.cardImage} data-size={size}>
        <Icon size={iconSize} className={styles.cardImageIcon} color={config.color} />
      </Box>
    );
  }

  return (
    <Box className={styles.cardImage} data-size={size}>
      <img src={src} alt={alt} className={styles.cardImageImg} />
    </Box>
  );
}

interface ExerciseGridCardProps {
  exercise: ExerciseItem;
  onClick: (exerciseId: number) => void;
  isLoading?: boolean;
  isSelected?: boolean;
}

/**
 * Grid card layout for exercise display
 * Shows image, title, badges, muscle groups, and description
 */
export function ExerciseGridCard({
  exercise,
  onClick,
  isLoading = false,
  isSelected = false,
}: ExerciseGridCardProps) {
  const config = categoryConfig[exercise.category];
  const uniqueMuscles = [...new Set(exercise.muscleGroups)];
  const visibleMuscles = uniqueMuscles.slice(0, 2);
  const remainingCount = uniqueMuscles.length - 2;

  const handleClick = useCallback(() => {
    onClick(exercise.id);
  }, [onClick, exercise.id]);

  return (
    <UnstyledButton onClick={handleClick} className={styles.cardButton}>
      <Card
        padding={0}
        radius="md"
        withBorder
        className={styles.gridCard}
        data-loading={isLoading}
        data-selected={isSelected}
      >
        <ExerciseCardImage
          src={exercise.primaryImage}
          alt={exercise.name}
          category={exercise.category}
          size="large"
        />

        <Box className={styles.cardContent}>
          <Flex justify="space-between" align="flex-start" gap="xs">
            <Box flex={1} miw={0}>
              <Title order={4} className={styles.cardTitle}>
                {exercise.name}
              </Title>
            </Box>
            <Box className={styles.cardIconWrapper} style={{ backgroundColor: config.bgColor }}>
              <config.icon size={16} color={config.color} />
            </Box>
          </Flex>
        </Box>

        <Stack gap="sm" className={styles.cardDetails}>
          <Group gap="xs" wrap="wrap">
            <CategoryBadge category={exercise.category} size="sm" showIcon={false} />
            {exercise.level && <ExerciseLevelBadge level={exercise.level} size="sm" />}
            {exercise.equipment && (
              <EquipmentIcon equipment={exercise.equipment} showLabel size="sm" />
            )}
          </Group>

          {exercise.muscleGroups.length > 0 && (
            <Group gap={4} wrap="wrap">
              {visibleMuscles.map((muscle) => (
                <Badge key={muscle} variant="outline" size="xs" c="dimmed" tt="capitalize">
                  {muscle}
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge variant="outline" size="xs" c="dimmed">
                  +{remainingCount} more
                </Badge>
              )}
            </Group>
          )}

          {exercise.description && (
            <Text fz="xs" c="dimmed" lineClamp={2}>
              {exercise.description}
            </Text>
          )}
        </Stack>
      </Card>
    </UnstyledButton>
  );
}

interface ExerciseListImageProps {
  src: string | null | undefined;
  alt: string;
  category: ExerciseCategory;
}

/**
 * Small image for list view rows
 */
export function ExerciseListImage({ src, alt, category }: ExerciseListImageProps) {
  return <ExerciseCardImage src={src} alt={alt} category={category} size="small" />;
}
