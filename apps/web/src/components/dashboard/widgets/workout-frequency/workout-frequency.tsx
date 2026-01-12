import { IconCalendarStats, IconFlame, IconTrendingUp } from "@tabler/icons-react";

import { Box, Flex, Group, SimpleGrid, Stack, Text, Tooltip } from "@mantine/core";

import { Card, FitAiCardContent, FitAiCardDescription, FitAiCardHeader, FitAiCardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./workout-frequency.module.css";

interface DayData {
  date: Date;
  workoutCount: number;
  totalVolume: number;
  workoutNames?: string[];
}

interface WorkoutFrequencyProps {
  days: DayData[];
  currentStreak: number;
  totalWorkouts: number;
  avgPerWeek: number;
  isLoading?: boolean;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getIntensityLevel(workoutCount: number, totalVolume: number): 0 | 1 | 2 | 3 | 4 {
  if (workoutCount === 0) return 0;
  if (workoutCount === 1 && totalVolume < 5000) return 1;
  if (workoutCount === 1 && totalVolume >= 5000) return 2;
  if (workoutCount === 2) return 3;
  return 4;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k kg`;
  }
  return `${volume} kg`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

interface HeatmapCellProps {
  day: DayData;
  index: number;
}

function HeatmapCell({ day, index }: HeatmapCellProps) {
  const level = getIntensityLevel(day.workoutCount, day.totalVolume);
  const levelClass = styles[`level${level}` as keyof typeof styles];
  const isTodayCell = isToday(day.date);

  const tooltipContent = (
    <Stack gap={4}>
      <Text size="xs" fw={600}>
        {formatDate(day.date)}
      </Text>
      {day.workoutCount > 0 ? (
        <>
          <Text size="xs">
            {day.workoutCount} workout{day.workoutCount > 1 ? "s" : ""}
          </Text>
          <Text size="xs" c="dimmed">
            Volume: {formatVolume(day.totalVolume)}
          </Text>
          {day.workoutNames && day.workoutNames.length > 0 && (
            <Text size="xs" c="dimmed">
              {day.workoutNames.slice(0, 3).join(", ")}
              {day.workoutNames.length > 3 && ` +${day.workoutNames.length - 3} more`}
            </Text>
          )}
        </>
      ) : (
        <Text size="xs" c="dimmed">
          Rest day
        </Text>
      )}
    </Stack>
  );

  return (
    <Tooltip label={tooltipContent} position="top" withArrow>
      <Box
        className={`${styles.cell} ${levelClass} ${isTodayCell ? styles.today : ""}`}
        style={{ animationDelay: `${index * 15}ms` }}
        aria-label={`${formatDate(day.date)}: ${day.workoutCount} workouts`}
      />
    </Tooltip>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconColor?: string;
}

function StatItem({ icon, label, value, iconColor }: StatItemProps) {
  return (
    <Flex align="center" gap="xs">
      <Box className={styles.statIcon} style={{ color: iconColor }}>
        {icon}
      </Box>
      <Stack gap={0}>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
        <Text size="sm" fw={600}>
          {value}
        </Text>
      </Stack>
    </Flex>
  );
}

function generateLast30Days(): DayData[] {
  const days: DayData[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);
    days.push({
      date,
      workoutCount: 0,
      totalVolume: 0,
    });
  }

  return days;
}

function padDaysToStartOfWeek(days: DayData[]): (DayData | null)[] {
  if (days.length === 0) return [];

  const firstDay = days[0];
  if (!firstDay) return days;

  const dayOfWeek = firstDay.date.getDay();
  const paddedDays: (DayData | null)[] = [];

  // Add null placeholders for days before the first day
  for (let i = 0; i < dayOfWeek; i++) {
    paddedDays.push(null);
  }

  // Add actual days
  for (const day of days) {
    paddedDays.push(day);
  }

  return paddedDays;
}

export function WorkoutFrequency({
  days,
  currentStreak,
  totalWorkouts,
  avgPerWeek,
  isLoading,
}: WorkoutFrequencyProps) {
  if (isLoading) {
    return (
      <Card className={styles.card}>
        <FitAiCardHeader>
          <Group justify="space-between">
            <Box>
              <FitAiCardTitle>Workout Frequency</FitAiCardTitle>
              <FitAiCardDescription>Last 30 days activity</FitAiCardDescription>
            </Box>
            <Skeleton h={32} w={32} radius="md" />
          </Group>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Stack gap="md">
            {/* Stats skeleton */}
            <SimpleGrid cols={3} spacing="xs">
              {Array.from({ length: 3 }).map((_, i) => (
                <Flex key={i} align="center" gap="xs">
                  <Skeleton h={24} w={24} radius="sm" />
                  <Stack gap={2}>
                    <Skeleton h={12} w={48} />
                    <Skeleton h={14} w={32} />
                  </Stack>
                </Flex>
              ))}
            </SimpleGrid>

            {/* Heatmap skeleton */}
            <Stack gap="xs">
              <Flex gap={4}>
                {DAY_LABELS.map((label) => (
                  <Box key={label} className={styles.dayLabel}>
                    <Skeleton h={10} w={20} />
                  </Box>
                ))}
              </Flex>
              <Box className={styles.heatmapGrid}>
                {Array.from({ length: 35 }).map((_, i) => (
                  <Skeleton key={i} h={20} w={20} radius="sm" />
                ))}
              </Box>
            </Stack>

            {/* Legend skeleton */}
            <Flex justify="flex-end" align="center" gap="xs">
              <Skeleton h={12} w={32} />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} h={12} w={12} radius="xs" />
              ))}
              <Skeleton h={12} w={32} />
            </Flex>
          </Stack>
        </FitAiCardContent>
      </Card>
    );
  }

  // Use provided days or generate empty 30-day grid
  const displayDays = days.length > 0 ? days : generateLast30Days();
  const paddedDays = padDaysToStartOfWeek(displayDays);
  const hasWorkouts = totalWorkouts > 0;

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
          {/* Summary Stats */}
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

          {/* Heatmap */}
          <Box className={styles.heatmapContainer}>
            {/* Day labels */}
            <Flex gap={4} className={styles.dayLabels}>
              {DAY_LABELS.map((label) => (
                <Box key={label} className={styles.dayLabel}>
                  <Text size="xs" c="dimmed">
                    {label.charAt(0)}
                  </Text>
                </Box>
              ))}
            </Flex>

            {/* Heatmap grid */}
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

          {/* Legend */}
          <Flex justify="flex-end" align="center" gap="xs" className={styles.legend}>
            <Text size="xs" c="dimmed">
              Less
            </Text>
            {[0, 1, 2, 3, 4].map((level) => (
              <Box
                key={level}
                className={`${styles.legendCell} ${styles[`level${level}` as keyof typeof styles]}`}
              />
            ))}
            <Text size="xs" c="dimmed">
              More
            </Text>
          </Flex>

          {/* Empty state message */}
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

export function WorkoutFrequencySkeleton() {
  return (
    <WorkoutFrequency
      days={[]}
      currentStreak={0}
      totalWorkouts={0}
      avgPerWeek={0}
      isLoading={true}
    />
  );
}
