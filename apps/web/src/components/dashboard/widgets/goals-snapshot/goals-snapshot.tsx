import { IconTargetArrow } from "@tabler/icons-react";
import { Badge, Group, Progress, Stack, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";

import { FitAiCard, FitAiCardContent, FitAiCardHeader, FitAiCardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state-views";
import { useDashboardActiveGoals, useDashboardGoalsSummary } from "../../queries/use-queries";

import styles from "./goals-snapshot.module.css";

function formatGoalType(goalType: string): string {
  return goalType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function GoalsSnapshot() {
  const { data: summary, isLoading: isSummaryLoading } = useDashboardGoalsSummary();
  const { data: activeGoalsData, isLoading: isGoalsLoading } = useDashboardActiveGoals();

  const isLoading = isSummaryLoading || isGoalsLoading;

  if (isLoading) {
    return (
      <FitAiCard className={styles.goalsCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>
            <Group gap="xs">
              <IconTargetArrow size={20} />
              Goals
            </Group>
          </FitAiCardTitle>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Stack gap="sm">
            <Group gap="xs">
              <Skeleton h={20} w={70} />
              <Skeleton h={20} w={90} />
            </Group>
            {Array.from({ length: 3 }).map((_, i) => (
              <Stack key={i} gap={4}>
                <Skeleton h={14} w={160} />
                <Skeleton h={8} w="100%" />
              </Stack>
            ))}
          </Stack>
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  const activeGoals = activeGoalsData ?? [];
  const totalActive = summary?.activeGoals ?? 0;
  const totalCompleted = summary?.completedGoals ?? 0;

  if (totalActive === 0 && totalCompleted === 0) {
    return (
      <FitAiCard className={styles.goalsCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>
            <Group gap="xs">
              <IconTargetArrow size={20} />
              Goals
            </Group>
          </FitAiCardTitle>
        </FitAiCardHeader>
        <FitAiCardContent>
          <EmptyState
            icon={<IconTargetArrow size={48} stroke={1.5} />}
            title="No goals yet"
            message="Set goals to track your progress"
          />
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  return (
    <FitAiCard className={styles.goalsCard}>
      <FitAiCardHeader>
        <Group justify="space-between" align="center">
          <FitAiCardTitle>
            <Group gap="xs">
              <IconTargetArrow size={20} />
              Goals
            </Group>
          </FitAiCardTitle>
          <Link to="/dashboard/goals" className={styles.viewAllLink}>
            View all
          </Link>
        </Group>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Stack gap="sm">
          <Group gap="xs">
            <Badge size="sm" variant="light" color="blue">
              {totalActive} active
            </Badge>
            <Badge size="sm" variant="light" color="teal">
              {totalCompleted} completed
            </Badge>
          </Group>

          {activeGoals.length > 0 && (
            <Stack gap={0}>
              {activeGoals.slice(0, 4).map((goal) => (
                <div key={goal.id} className={styles.goalItem}>
                  <Stack gap={4}>
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="sm" fw={500} lineClamp={1}>
                        {goal.title}
                      </Text>
                      <Badge size="xs" variant="outline" color="gray">
                        {formatGoalType(goal.goalType)}
                      </Badge>
                    </Group>
                    <Group gap="xs" align="center">
                      <Progress value={goal.progressPercentage} size="sm" color="teal" flex={1} />
                      <Text size="xs" c="dimmed" w={36} ta="right">
                        {Math.round(goal.progressPercentage)}%
                      </Text>
                    </Group>
                  </Stack>
                </div>
              ))}
            </Stack>
          )}
        </Stack>
      </FitAiCardContent>
    </FitAiCard>
  );
}
