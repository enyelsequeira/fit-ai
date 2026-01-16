import { useMemo } from "react";

import { IconCalendarStats, IconFlame, IconTrendingUp } from "@tabler/icons-react";

import { Box, Flex, Group, SimpleGrid, Stack, Text } from "@mantine/core";

import {
  Card,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";

import { FrequencyLegend } from "./frequency-legend";
import { HeatmapCell } from "./heatmap-cell";
import { StatItem } from "./stat-item";
import type { DayData } from "./utils";
import { DAY_LABELS, generateLast30Days, padDaysToStartOfWeek } from "./utils";
import { WorkoutFrequencySkeleton } from "./workout-frequency-skeleton";

import styles from "./workout-frequency.module.css";

interface WorkoutFrequencyProps {
  days: DayData[];
  currentStreak: number;
  totalWorkouts: number;
  avgPerWeek: number;
  isLoading?: boolean;
}

export function WorkoutFrequency({
  days,
  currentStreak,
  totalWorkouts,
  avgPerWeek,
  isLoading,
}: WorkoutFrequencyProps) {
  const { paddedDays, hasWorkouts } = useMemo(() => {
    const display = days.length > 0 ? days : generateLast30Days();
    return {
      paddedDays: padDaysToStartOfWeek(display),
      hasWorkouts: totalWorkouts > 0,
    };
  }, [days, totalWorkouts]);

  if (isLoading) {
    return <WorkoutFrequencySkeleton />;
  }

  return (
    <Card className={styles.card}>
      <FitAiCardHeader>
        <Group justify="space-between">
          <Box>
            <FitAiCardTitle>Workout Frequency</FitAiCardTitle>
            <FitAiCardDescription>Last 30 days activity</FitAiCardDescription>
          </Box>
          <Box className={styles.headerIcon}>
            <IconCalendarStats size={20} />
          </Box>
        </Group>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Stack gap="md">
          <SimpleGrid cols={3} spacing="xs" className={styles.statsGrid}>
            <StatItem
              icon={<IconCalendarStats size={16} />}
              label="Total"
              value={totalWorkouts}
              iconColor="var(--mantine-color-blue-6)"
            />
            <StatItem
              icon={<IconFlame size={16} />}
              label="Streak"
              value={`${currentStreak}d`}
              iconColor="var(--mantine-color-orange-6)"
            />
            <StatItem
              icon={<IconTrendingUp size={16} />}
              label="Avg/Week"
              value={avgPerWeek.toFixed(1)}
              iconColor="var(--mantine-color-teal-6)"
            />
          </SimpleGrid>

          <Box className={styles.heatmapContainer}>
            <Flex gap={4} className={styles.dayLabels}>
              {DAY_LABELS.map((label) => (
                <Box key={label} className={styles.dayLabel}>
                  <Text size="xs" c="dimmed">
                    {label.charAt(0)}
                  </Text>
                </Box>
              ))}
            </Flex>

            <Box className={styles.heatmapGrid}>
              {paddedDays.map((day, index) =>
                day ? (
                  <HeatmapCell key={day.date.toISOString()} day={day} index={index} />
                ) : (
                  <Box key={`empty-${index}`} className={styles.emptyCell} />
                ),
              )}
            </Box>
          </Box>

          <FrequencyLegend />

          {!hasWorkouts && (
            <Box className={styles.emptyMessage}>
              <Text size="sm" c="dimmed" ta="center">
                No workouts logged yet. Start training to see your activity!
              </Text>
            </Box>
          )}
        </Stack>
      </FitAiCardContent>
    </Card>
  );
}

export { WorkoutFrequencySkeleton };
export type { DayData };
