/**
 * WorkoutList - List of workout cards with filtering
 * Shows workouts in a scrollable list, filtered by selected date
 */

import { Box, Button, Group, Stack, Text } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";
import { WorkoutCard, WorkoutCardSkeleton } from "./workout-card";
import { WorkoutEmptyState } from "./empty-state";
import type { WorkoutOutput } from "@fit-ai/api/routers/workout";
import styles from "./workout-list.module.css";

/**
 * Ensure a value is a valid Date object
 */
function ensureDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

interface WorkoutListProps {
  workouts: WorkoutOutput[];
  selectedDate: Date | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onWorkoutClick: (id: number) => void;
  onStartWorkout: () => void;
  onUseTemplate: () => void;
}

export function WorkoutList({
  workouts,
  selectedDate,
  isLoading,
  isError,
  onRetry,
  onWorkoutClick,
  onStartWorkout,
  onUseTemplate,
}: WorkoutListProps) {
  // Determine the description based on filter state
  const getDescription = (): string => {
    if (selectedDate) {
      const date = ensureDate(selectedDate);
      if (date) {
        return `Workouts on ${date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}`;
      }
    }
    return "Your recent workout sessions";
  };

  // Loading state
  if (isLoading) {
    return (
      <FitAiCard className={styles.listCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>Workouts</FitAiCardTitle>
          <FitAiCardDescription>Loading your workouts...</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Stack gap="sm" className={styles.loadingContainer}>
            {Array.from({ length: 3 }).map((_, i) => (
              <WorkoutCardSkeleton key={i} />
            ))}
          </Stack>
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  // Error state
  if (isError) {
    return (
      <FitAiCard className={styles.listCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>Workouts</FitAiCardTitle>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Box className={styles.errorContainer}>
            <IconAlertCircle size={48} className={styles.errorIcon} />
            <Text fw={500} mb="xs">
              Failed to load workouts
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              There was an error loading your workouts. Please try again.
            </Text>
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={onRetry}
              className={styles.retryButton}
            >
              Retry
            </Button>
          </Box>
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  // Empty state
  if (workouts.length === 0) {
    return (
      <WorkoutEmptyState
        hasDateFilter={!!selectedDate}
        selectedDate={selectedDate}
        onStartWorkout={onStartWorkout}
        onUseTemplate={onUseTemplate}
        onClearFilter={() => {
          // This will be handled by parent
        }}
      />
    );
  }

  return (
    <FitAiCard className={styles.listCard}>
      <FitAiCardHeader>
        <Group className={styles.listHeader}>
          <Box>
            <FitAiCardTitle>Workouts</FitAiCardTitle>
            <FitAiCardDescription>{getDescription()}</FitAiCardDescription>
          </Box>
          <Box className={styles.workoutCount}>{workouts.length} workouts</Box>
        </Group>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Stack gap="sm" className={styles.workoutList}>
          {workouts.map((workout, index) => {
            // Calculate duration from startedAt and completedAt
            const duration = workout.completedAt
              ? Math.round(
                  (new Date(workout.completedAt).getTime() -
                    new Date(workout.startedAt).getTime()) /
                    (1000 * 60)
                )
              : null;

            return (
              <WorkoutCard
                key={workout.id}
                id={workout.id}
                name={workout.name}
                date={new Date(workout.startedAt)}
                duration={duration}
                isCompleted={!!workout.completedAt}
                mood={workout.mood}
                rating={workout.rating}
                onClick={onWorkoutClick}
                animationDelay={index * 50}
              />
            );
          })}
        </Stack>
      </FitAiCardContent>
    </FitAiCard>
  );
}
