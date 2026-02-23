/**
 * GoalProgressTab - Displays goal analytics with stat cards, type distribution, and progress lists
 */

import type { GoalAnalyticsData } from "./use-analytics-data";

import { IconChartPie, IconCircleCheck, IconClock, IconTarget } from "@tabler/icons-react";
import { Badge, Box, Group, Progress, Stack, Text } from "@mantine/core";
import { DonutChart } from "@mantine/charts";

import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state-views";

import { SummaryCard, SummaryCardSkeleton } from "./summary-card";

import styles from "./analytics-view.module.css";

interface GoalProgressTabProps {
  goalAnalytics: GoalAnalyticsData;
  isLoading: boolean;
}

const GOAL_TYPE_COLORS: Record<string, string> = {
  weight: "red",
  strength: "blue",
  body_measurement: "violet",
  workout_frequency: "teal",
  custom: "gray",
};

function GoalTypeLabel({ goalType }: { goalType: string }) {
  const color = GOAL_TYPE_COLORS[goalType] ?? "gray";
  const label = goalType.replace(/_/g, " ");
  return (
    <Badge size="xs" variant="light" color={color}>
      {label}
    </Badge>
  );
}

function GoalStatCards({
  goalAnalytics,
  isLoading,
}: {
  goalAnalytics: GoalAnalyticsData;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Box className={styles.summaryGrid} data-section="goal-summary">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </Box>
    );
  }

  return (
    <Box className={styles.summaryGrid} data-section="goal-summary">
      <SummaryCard
        icon={<IconTarget size={20} />}
        iconBg="var(--mantine-color-violet-1)"
        iconColor="var(--mantine-color-violet-6)"
        value={goalAnalytics.activeGoals}
        label="Active Goals"
      />
      <SummaryCard
        icon={<IconCircleCheck size={20} />}
        iconBg="var(--mantine-color-teal-1)"
        iconColor="var(--mantine-color-teal-6)"
        value={goalAnalytics.completedGoals}
        label="Completed Goals"
      />
      <SummaryCard
        icon={<IconChartPie size={20} />}
        iconBg="var(--mantine-color-blue-1)"
        iconColor="var(--mantine-color-blue-6)"
        value={`${goalAnalytics.overallCompletionRate.toFixed(0)}%`}
        label="Completion Rate"
      />
      <SummaryCard
        icon={<IconClock size={20} />}
        iconBg="var(--mantine-color-orange-1)"
        iconColor="var(--mantine-color-orange-6)"
        value={
          goalAnalytics.avgCompletionDays !== null
            ? `${goalAnalytics.avgCompletionDays}d`
            : "\u2014"
        }
        label="Avg Days to Complete"
      />
    </Box>
  );
}

function GoalsByTypeChart({ goalsByType }: { goalsByType: GoalAnalyticsData["goalsByType"] }) {
  if (goalsByType.length === 0) {
    return (
      <FitAiCard className={styles.chartCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>Goals by Type</FitAiCardTitle>
          <FitAiCardDescription>Distribution of your goals</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <EmptyState title="No goals yet" message="Create goals to see distribution by type" />
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  const chartData = goalsByType.map((item) => ({
    name: item.type.replace(/_/g, " "),
    value: item.count,
    color: `var(--mantine-color-${GOAL_TYPE_COLORS[item.type] ?? "gray"}-6)`,
  }));

  return (
    <FitAiCard className={styles.chartCard}>
      <FitAiCardHeader>
        <FitAiCardTitle>Goals by Type</FitAiCardTitle>
        <FitAiCardDescription>Distribution of your goals</FitAiCardDescription>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Group justify="center" gap="xl" wrap="wrap">
          <DonutChart data={chartData} size={180} thickness={28} tooltipDataSource="segment" />
          <Stack gap="xs">
            {goalsByType.map((item) => (
              <Group key={item.type} gap="xs" wrap="nowrap">
                <GoalTypeLabel goalType={item.type} />
                <Text size="xs">
                  {item.count} total, {item.completedCount} done
                </Text>
              </Group>
            ))}
          </Stack>
        </Group>
      </FitAiCardContent>
    </FitAiCard>
  );
}

function ActiveProgressList({
  activeProgress,
}: {
  activeProgress: GoalAnalyticsData["activeProgress"];
}) {
  if (activeProgress.length === 0) {
    return (
      <FitAiCard className={styles.chartCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>Active Progress</FitAiCardTitle>
          <FitAiCardDescription>Your in-progress goals</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <EmptyState title="No active goals" message="Create a goal to track your progress" />
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  return (
    <FitAiCard className={styles.chartCard}>
      <FitAiCardHeader>
        <FitAiCardTitle>Active Progress</FitAiCardTitle>
        <FitAiCardDescription>{activeProgress.length} active goals</FitAiCardDescription>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Stack gap="md">
          {activeProgress.map((goal) => (
            <Stack key={goal.id} gap="xs">
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap="xs" wrap="nowrap">
                  <Text size="sm" fw={500} lineClamp={1}>
                    {goal.title}
                  </Text>
                  <GoalTypeLabel goalType={goal.goalType} />
                </Group>
                <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                  {goal.progressPercentage}%
                </Text>
              </Group>
              <Progress
                value={goal.progressPercentage}
                size="sm"
                color={
                  goal.progressPercentage >= 75
                    ? "teal"
                    : goal.progressPercentage >= 50
                      ? "blue"
                      : "orange"
                }
              />
              {goal.daysRemaining !== null && (
                <Text size="xs" c="dimmed">
                  {goal.daysRemaining} days remaining
                </Text>
              )}
            </Stack>
          ))}
        </Stack>
      </FitAiCardContent>
    </FitAiCard>
  );
}

function RecentlyCompletedList({
  recentlyCompleted,
}: {
  recentlyCompleted: GoalAnalyticsData["recentlyCompleted"];
}) {
  if (recentlyCompleted.length === 0) {
    return (
      <FitAiCard className={styles.chartCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>Recently Completed</FitAiCardTitle>
          <FitAiCardDescription>Your latest achievements</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <EmptyState title="No completed goals yet" message="Keep working toward your goals!" />
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  return (
    <FitAiCard className={styles.chartCard}>
      <FitAiCardHeader>
        <FitAiCardTitle>Recently Completed</FitAiCardTitle>
        <FitAiCardDescription>Your latest achievements</FitAiCardDescription>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Stack gap="sm">
          {recentlyCompleted.map((goal) => (
            <Group key={goal.id} justify="space-between" align="center" wrap="nowrap">
              <Group gap="xs" wrap="nowrap">
                <IconCircleCheck size={16} color="var(--mantine-color-teal-6)" />
                <Text size="sm" lineClamp={1}>
                  {goal.title}
                </Text>
                <GoalTypeLabel goalType={goal.goalType} />
              </Group>
              {goal.completedAt && (
                <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                  {new Date(goal.completedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              )}
            </Group>
          ))}
        </Stack>
      </FitAiCardContent>
    </FitAiCard>
  );
}

export function GoalProgressTab({ goalAnalytics, isLoading }: GoalProgressTabProps) {
  if (isLoading) {
    return (
      <Stack gap="md" data-tab-content="goals">
        <GoalStatCards goalAnalytics={goalAnalytics} isLoading={true} />
      </Stack>
    );
  }

  return (
    <Stack gap="md" data-tab-content="goals">
      <GoalStatCards goalAnalytics={goalAnalytics} isLoading={false} />
      <GoalsByTypeChart goalsByType={goalAnalytics.goalsByType} />
      <Box className={styles.chartsGrid}>
        <ActiveProgressList activeProgress={goalAnalytics.activeProgress} />
        <RecentlyCompletedList recentlyCompleted={goalAnalytics.recentlyCompleted} />
      </Box>
    </Stack>
  );
}
