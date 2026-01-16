/**
 * GoalCard - Individual goal card component
 * Displays goal details with progress bar and quick actions
 */

import { Box, Group, Skeleton } from "@mantine/core";

import { FitAiCard, FitAiCardContent } from "@/components/ui/card";

import { GoalCardActions } from "./goal-card-actions";
import { GoalCardHeader } from "./goal-card-header";
import { GoalCardProgress } from "./goal-card-progress";
import type { GoalType, GoalWithExercise } from "./types";
import styles from "./goals-view.module.css";

interface GoalCardProps {
  goal: GoalWithExercise;
  onClick?: (goal: GoalWithExercise) => void;
  onLogProgress?: (goal: GoalWithExercise) => void;
  onComplete?: (goal: GoalWithExercise) => void;
  onPause?: (goal: GoalWithExercise) => void;
  onResume?: (goal: GoalWithExercise) => void;
  onAbandon?: (goal: GoalWithExercise) => void;
  onDelete?: (goal: GoalWithExercise) => void;
  animationDelay?: number;
}

export function GoalCard({
  goal,
  onClick,
  onLogProgress,
  onComplete,
  onPause,
  onResume,
  onAbandon,
  onDelete,
  animationDelay = 0,
}: GoalCardProps) {
  const goalType = goal.goalType as GoalType;
  const progress = goal.progressPercentage ?? 0;

  return (
    <FitAiCard
      className={styles.goalCard}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={() => onClick?.(goal)}
      data-status={goal.status}
      data-goal-type={goalType}
    >
      <FitAiCardContent>
        <GoalCardHeader goal={goal} goalType={goalType} />

        <GoalCardProgress goal={goal} progress={progress} />

        <GoalCardActions
          goal={goal}
          onLogProgress={onLogProgress}
          onComplete={onComplete}
          onPause={onPause}
          onResume={onResume}
          onAbandon={onAbandon}
          onDelete={onDelete}
        />
      </FitAiCardContent>
    </FitAiCard>
  );
}

/**
 * Skeleton component for loading states
 */
export function GoalCardSkeleton() {
  return (
    <FitAiCard className={styles.goalCard}>
      <FitAiCardContent>
        <Group justify="space-between" align="flex-start" gap="sm" mb="sm">
          <Group align="flex-start" gap="sm" style={{ flex: 1 }}>
            <Skeleton w={40} h={40} radius="md" />
            <Box style={{ flex: 1 }}>
              <Skeleton h={16} w={160} mb={8} />
              <Skeleton h={12} w={80} />
            </Box>
          </Group>
          <Skeleton h={20} w={60} radius="xl" />
        </Group>
        <Box mt="md">
          <Skeleton h={8} w="100%" radius="xl" />
        </Box>
      </FitAiCardContent>
    </FitAiCard>
  );
}
