import { IconBarbell, IconHistory } from "@tabler/icons-react";
import { Box, Group, Stack, Text } from "@mantine/core";

import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state-views";
import { formatRelativeDate, formatVolume } from "@/components/ui/utils";
import { useDashboardData } from "../../shared/use-dashboard-data";

import styles from "./activity-overview.module.css";

export function ActivityOverview() {
  const { activity } = useDashboardData();
  const { recentWorkouts, isLoading } = activity;

  if (isLoading) {
    return (
      <FitAiCard className={styles.activityCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>
            <Group gap="xs">
              <IconHistory size={20} />
              Recent Activity
            </Group>
          </FitAiCardTitle>
          <FitAiCardDescription>Last 5 workouts</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Stack gap="sm">
            {Array.from({ length: 3 }).map((_, i) => (
              <Group key={i} justify="space-between">
                <Stack gap={4}>
                  <Skeleton h={14} w={140} />
                  <Skeleton h={12} w={80} />
                </Stack>
                <Skeleton h={12} w={60} />
              </Group>
            ))}
          </Stack>
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  if (recentWorkouts.length === 0) {
    return (
      <FitAiCard className={styles.activityCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>
            <Group gap="xs">
              <IconHistory size={20} />
              Recent Activity
            </Group>
          </FitAiCardTitle>
          <FitAiCardDescription>Last 5 workouts</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <EmptyState
            icon={<IconBarbell size={48} stroke={1.5} />}
            title="No workouts yet"
            message="Complete your first workout to see activity here"
          />
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  return (
    <FitAiCard className={styles.activityCard}>
      <FitAiCardHeader>
        <FitAiCardTitle>
          <Group gap="xs">
            <IconHistory size={20} />
            Recent Activity
          </Group>
        </FitAiCardTitle>
        <FitAiCardDescription>Last 5 workouts</FitAiCardDescription>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Stack gap={0}>
          {recentWorkouts.map((workout, index) => (
            <Box
              key={workout.id}
              className={`${styles.workoutItem} ${index < recentWorkouts.length - 1 ? styles.workoutDivider : ""}`}
            >
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={2}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {workout.name}
                  </Text>
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      {formatRelativeDate(workout.date)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {workout.exerciseCount} exercises
                    </Text>
                  </Group>
                </Stack>
                <Text size="xs" fw={500} c="dimmed" style={{ whiteSpace: "nowrap" }}>
                  {formatVolume(workout.totalVolume)}
                </Text>
              </Group>
            </Box>
          ))}
        </Stack>
      </FitAiCardContent>
    </FitAiCard>
  );
}
