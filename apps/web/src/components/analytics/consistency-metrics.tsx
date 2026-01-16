/**
 * ConsistencyMetrics - Displays workout consistency statistics
 */

import {
  IconCalendar,
  IconFlame,
  IconTarget,
  IconTrendingUp,
  IconBarbell,
} from "@tabler/icons-react";
import { Box, Center, Group, RingProgress, Stack, Text } from "@mantine/core";

import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardHeader,
  FitAiCardTitle,
  FitAiCardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ConsistencyData } from "./use-analytics-data";

import styles from "./analytics-view.module.css";

interface ConsistencyMetricsProps {
  data: ConsistencyData;
  isLoading?: boolean;
}

interface StreakCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: number | string;
  label: string;
  subLabel?: string;
}

function StreakCard({ icon, iconBg, iconColor, value, label, subLabel }: StreakCardProps) {
  return (
    <FitAiCard className={styles.summaryCard} data-card-type="streak">
      <FitAiCardContent>
        <Group gap="md" align="center" p="md" wrap="nowrap">
          <Center
            w={48}
            h={48}
            style={{
              borderRadius: "50%",
              backgroundColor: iconBg,
              color: iconColor,
            }}
          >
            {icon}
          </Center>
          <Stack gap={0}>
            <Text fz="1.75rem" fw={700} lh={1}>
              {value}
            </Text>
            <Text size="xs" c="dimmed">
              {label}
            </Text>
            {subLabel && (
              <Text size="xs" c="dimmed">
                {subLabel}
              </Text>
            )}
          </Stack>
        </Group>
      </FitAiCardContent>
    </FitAiCard>
  );
}

export function ConsistencyMetrics({ data, isLoading }: ConsistencyMetricsProps) {
  if (isLoading) {
    return (
      <Box data-component="consistency-metrics" data-loading="true">
        <Stack gap="xs" mb="md">
          <Group gap="xs">
            <IconTarget size={20} />
            <Text fw={500} size="sm">
              Consistency Metrics
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            Your workout consistency stats
          </Text>
        </Stack>

        <Box className={styles.consistencyGrid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <FitAiCard key={i}>
              <FitAiCardContent>
                <Group gap="md" align="center" p="md" wrap="nowrap">
                  <Skeleton circle h={48} w={48} />
                  <Stack gap={4}>
                    <Skeleton h={24} w={60} />
                    <Skeleton h={14} w={100} />
                  </Stack>
                </Group>
              </FitAiCardContent>
            </FitAiCard>
          ))}
        </Box>
      </Box>
    );
  }

  const { currentStreak, longestStreak, avgWorkoutsPerWeek, completionRate, totalWorkouts } = data;

  // Calculate streak comparison
  const streakPercentage =
    longestStreak > 0 ? Math.min((currentStreak / longestStreak) * 100, 100) : 0;

  // Determine streak status message
  const streakMessage = (() => {
    if (currentStreak === 0) return "Start your streak today!";
    if (currentStreak >= longestStreak && longestStreak > 0) return "New record!";
    if (currentStreak >= longestStreak * 0.8) return "Almost at your best!";
    return `${longestStreak - currentStreak} days to beat your record`;
  })();

  const hasStreak = currentStreak > 0;

  return (
    <Box
      data-component="consistency-metrics"
      data-loading="false"
      data-has-streak={String(hasStreak)}
    >
      <Stack gap="xs" mb="md">
        <Group gap="xs">
          <IconTarget size={20} />
          <Text fw={500} size="sm">
            Consistency Metrics
          </Text>
        </Group>
        <Text size="xs" c="dimmed">
          Your workout consistency stats
        </Text>
      </Stack>

      {/* Main streak cards */}
      <Box className={styles.consistencyGrid}>
        <StreakCard
          icon={<IconFlame size={24} />}
          iconBg="var(--mantine-color-orange-1)"
          iconColor="var(--mantine-color-orange-6)"
          value={currentStreak}
          label="Current Streak"
          subLabel={currentStreak === 1 ? "day" : "days"}
        />

        <StreakCard
          icon={<IconTrendingUp size={24} />}
          iconBg="var(--mantine-color-yellow-1)"
          iconColor="var(--mantine-color-yellow-7)"
          value={longestStreak}
          label="Best Streak"
          subLabel={longestStreak === 1 ? "day" : "days"}
        />

        <StreakCard
          icon={<IconCalendar size={24} />}
          iconBg="var(--mantine-color-teal-1)"
          iconColor="var(--mantine-color-teal-6)"
          value={avgWorkoutsPerWeek.toFixed(1)}
          label="Avg per Week"
          subLabel="workouts"
        />
      </Box>

      {/* Additional stats */}
      <Box className={styles.chartsGrid} mt="md">
        {/* Streak progress card */}
        <FitAiCard className={styles.chartCard} data-card-type="streak-progress">
          <FitAiCardHeader>
            <FitAiCardTitle>Streak Progress</FitAiCardTitle>
            <FitAiCardDescription>{streakMessage}</FitAiCardDescription>
          </FitAiCardHeader>
          <FitAiCardContent>
            <Group align="center" gap="xl" justify="center" py="md">
              <RingProgress
                size={120}
                thickness={12}
                roundCaps
                sections={[
                  {
                    value: streakPercentage,
                    color: currentStreak >= longestStreak ? "teal" : "blue",
                  },
                ]}
                label={
                  <Stack align="center" gap={0}>
                    <Text size="xl" fw={700}>
                      {currentStreak}
                    </Text>
                    <Text size="xs" c="dimmed">
                      of {longestStreak}
                    </Text>
                  </Stack>
                }
              />

              <Stack gap="xs">
                <Group align="center" gap="xs">
                  <Box
                    w={12}
                    h={12}
                    style={{
                      borderRadius: "50%",
                      backgroundColor: "var(--mantine-color-blue-6)",
                    }}
                  />
                  <Text size="sm">Current: {currentStreak} days</Text>
                </Group>
                <Group align="center" gap="xs">
                  <Box
                    w={12}
                    h={12}
                    style={{
                      borderRadius: "50%",
                      backgroundColor: "var(--mantine-color-gray-4)",
                    }}
                  />
                  <Text size="sm">Best: {longestStreak} days</Text>
                </Group>
              </Stack>
            </Group>
          </FitAiCardContent>
        </FitAiCard>

        {/* Total stats card */}
        <FitAiCard className={styles.chartCard} data-card-type="overall-stats">
          <FitAiCardHeader>
            <FitAiCardTitle>Overall Stats</FitAiCardTitle>
            <FitAiCardDescription>Your all-time statistics</FitAiCardDescription>
          </FitAiCardHeader>
          <FitAiCardContent>
            <Stack gap="md" py="md">
              <Group justify="space-between" align="center">
                <Group align="center" gap="xs">
                  <IconBarbell size={18} color="var(--mantine-color-blue-6)" />
                  <Text size="sm">Total Workouts</Text>
                </Group>
                <Text fw={600}>{totalWorkouts}</Text>
              </Group>

              <Group justify="space-between" align="center">
                <Group align="center" gap="xs">
                  <IconCalendar size={18} color="var(--mantine-color-teal-6)" />
                  <Text size="sm">Weekly Average</Text>
                </Group>
                <Text fw={600}>{avgWorkoutsPerWeek.toFixed(1)}</Text>
              </Group>

              <Group justify="space-between" align="center">
                <Group align="center" gap="xs">
                  <IconTarget size={18} color="var(--mantine-color-violet-6)" />
                  <Text size="sm">Completion Rate</Text>
                </Group>
                <Text fw={600}>{(completionRate * 100).toFixed(0)}%</Text>
              </Group>

              <Group justify="space-between" align="center">
                <Group align="center" gap="xs">
                  <IconFlame size={18} color="var(--mantine-color-orange-6)" />
                  <Text size="sm">Current Streak</Text>
                </Group>
                <Text fw={600}>
                  {currentStreak} {currentStreak === 1 ? "day" : "days"}
                </Text>
              </Group>
            </Stack>
          </FitAiCardContent>
        </FitAiCard>
      </Box>
    </Box>
  );
}
