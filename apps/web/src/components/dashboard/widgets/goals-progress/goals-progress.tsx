import type { ReactNode } from "react";

import {
  IconBarbell,
  IconFlame,
  IconPlus,
  IconScale,
  IconTarget,
  IconTrendingUp,
} from "@tabler/icons-react";

import { Badge, Box, Flex, RingProgress, Stack, Text } from "@mantine/core";

import { FitAiButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./goals-progress.module.css";

type GoalType = "weight" | "strength" | "consistency" | "volume" | "custom";

interface Goal {
  id: number;
  name: string;
  type: GoalType;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline: Date;
  progress: number;
}

interface GoalsProgressProps {
  goals: Goal[];
  isLoading?: boolean;
  onGoalClick?: (goalId: number) => void;
  onCreateGoal?: () => void;
}

const GOAL_TYPE_ICONS: Record<GoalType, ReactNode> = {
  weight: <IconScale size={16} />,
  strength: <IconBarbell size={16} />,
  consistency: <IconFlame size={16} />,
  volume: <IconTrendingUp size={16} />,
  custom: <IconTarget size={16} />,
};

function getDaysRemaining(deadline: Date): number {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getProgressStatus(
  progress: number,
  daysRemaining: number,
): "on-track" | "behind" | "overdue" {
  if (daysRemaining < 0) {
    return "overdue";
  }

  // Calculate expected progress based on time passed
  // If deadline is in the past, we're overdue
  // If progress is less than 70% of expected, we're behind
  const expectedProgress = 100 - daysRemaining * 3; // Rough heuristic

  if (progress >= expectedProgress * 0.7) {
    return "on-track";
  }

  return "behind";
}

function getProgressColor(status: "on-track" | "behind" | "overdue"): string {
  const colors: Record<string, string> = {
    "on-track": "teal",
    behind: "yellow",
    overdue: "red",
  };
  return colors[status] ?? "teal";
}

function formatDaysRemaining(days: number): string {
  if (days < 0) {
    return `${Math.abs(days)}d overdue`;
  }
  if (days === 0) {
    return "Due today";
  }
  if (days === 1) {
    return "1 day left";
  }
  return `${days} days left`;
}

function GoalCard({ goal, onClick, index }: { goal: Goal; onClick?: () => void; index: number }) {
  const daysRemaining = getDaysRemaining(goal.deadline);
  const status = getProgressStatus(goal.progress, daysRemaining);
  const progressColor = getProgressColor(status);
  const isUrgent = daysRemaining >= 0 && daysRemaining < 7;
  const isOverdue = daysRemaining < 0;
  const Icon = GOAL_TYPE_ICONS[goal.type];

  return (
    <Box
      className={styles.goalCard}
      onClick={onClick}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Flex align="center" gap="sm">
        <RingProgress
          size={56}
          thickness={5}
          roundCaps
          sections={[{ value: Math.min(goal.progress, 100), color: progressColor }]}
          label={
            <Text fz="xs" fw={700} ta="center" c={progressColor}>
              {Math.round(goal.progress)}%
            </Text>
          }
          className={styles.ringProgress}
        />
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex align="center" gap={6} mb={2}>
            <Box
              className={`${styles.goalTypeIcon} ${styles[`icon${goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}`]}`}
            >
              {Icon}
            </Box>
            <Text size="sm" fw={500} truncate>
              {goal.name}
            </Text>
          </Flex>
          <Text size="xs" c="dimmed">
            {goal.currentValue} / {goal.targetValue} {goal.unit}
          </Text>
        </Box>
        <Badge
          size="sm"
          variant="light"
          color={isOverdue ? "red" : isUrgent ? "yellow" : "gray"}
          className={isUrgent || isOverdue ? styles.urgentBadge : undefined}
        >
          {formatDaysRemaining(daysRemaining)}
        </Badge>
      </Flex>
    </Box>
  );
}

function GoalCardSkeleton() {
  return (
    <Box className={styles.goalCard} style={{ cursor: "default" }}>
      <Flex align="center" gap="sm">
        <Skeleton h={56} w={56} radius="xl" />
        <Box style={{ flex: 1 }}>
          <Flex align="center" gap={6} mb={2}>
            <Skeleton h={20} w={20} radius="sm" />
            <Skeleton h={16} w={96} />
          </Flex>
          <Skeleton h={12} w={80} />
        </Box>
        <Skeleton h={22} w={72} radius="xl" />
      </Flex>
    </Box>
  );
}

export function GoalsProgress({ goals, isLoading, onGoalClick, onCreateGoal }: GoalsProgressProps) {
  // Limit to 3 active goals for display
  const displayGoals = goals.slice(0, 3);

  return (
    <Card className={styles.card}>
      <CardHeader>
        <Flex justify="space-between" align="flex-start">
          <Box>
            <CardTitle>
              <Flex align="center" gap="xs">
                <IconTarget size={20} className={styles.headerIcon} />
                Goals Progress
              </Flex>
            </CardTitle>
            <CardDescription>Track your active fitness goals</CardDescription>
          </Box>
          {!isLoading && goals.length > 0 && (
            <FitAiButton
              variant="ghost"
              size="icon-xs"
              onClick={onCreateGoal}
              aria-label="Create new goal"
            >
              <IconPlus size={16} />
            </FitAiButton>
          )}
        </Flex>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Stack gap="sm">
            {Array.from({ length: 3 }).map((_, i) => (
              <GoalCardSkeleton key={i} />
            ))}
          </Stack>
        ) : displayGoals.length === 0 ? (
          <Stack py="md" gap="xs" align="center" ta="center" className={styles.emptyState}>
            <Box className={styles.emptyIcon}>
              <IconTarget size={32} />
            </Box>
            <Text size="sm" fw={500}>No active goals</Text>
            <Text size="xs" c="dimmed">
              Set goals to track your fitness journey
            </Text>
            <FitAiButton size="sm" onClick={onCreateGoal} leftSection={<IconPlus size={14} />}>
              Create Goal
            </FitAiButton>
          </Stack>
        ) : (
          <Stack gap="sm">
            {displayGoals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onClick={() => onGoalClick?.(goal.id)}
                index={index}
              />
            ))}
            {goals.length > 3 && (
              <Text size="xs" c="dimmed" ta="center" pt="xs">
                +{goals.length - 3} more goals
              </Text>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export function GoalsProgressSkeleton() {
  return <GoalsProgress goals={[]} isLoading={true} />;
}
