/**
 * WorkoutStats - Summary statistics cards for workouts
 * Displays key metrics like total workouts, weekly count, streak, and volume
 */

import { Box, Flex, Group, SimpleGrid, Text } from "@mantine/core";
import { IconActivity, IconBarbell, IconClock, IconFlame } from "@tabler/icons-react";
import { FitAiCard, FitAiCardContent, FitAiCardHeader, FitAiCardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorkoutStats as WorkoutStatsType } from "./types";
import styles from "./workout-stats.module.css";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconVariant: "blue" | "orange" | "teal" | "violet";
  description?: string;
  isLoading?: boolean;
  animationDelay?: number;
}

function StatCard({
  title,
  value,
  icon,
  iconVariant,
  description,
  isLoading,
  animationDelay = 0,
}: StatCardProps) {
  if (isLoading) {
    return (
      <FitAiCard>
        <FitAiCardHeader>
          <Group justify="space-between" pb="xs">
            <Skeleton h={16} w={96} />
            <Skeleton h={16} w={16} />
          </Group>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Skeleton h={32} w={64} mb={4} />
          <Skeleton h={12} w={128} />
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  return (
    <FitAiCard className={styles.statCard} style={{ animationDelay: `${animationDelay}ms` }}>
      <FitAiCardHeader>
        <Group justify="space-between" pb="xs">
          <FitAiCardTitle c="dimmed" fw={500}>
            {title}
          </FitAiCardTitle>
          <Box className={styles.iconWrapper} data-variant={iconVariant}>
            {icon}
          </Box>
        </Group>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Text fz={24} fw={700}>
          {value}
        </Text>
        {description && (
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        )}
      </FitAiCardContent>
    </FitAiCard>
  );
}

interface WorkoutStatsProps {
  stats: WorkoutStatsType;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatVolume(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}k kg`;
  }
  return `${kg} kg`;
}

export function WorkoutStats({ stats }: WorkoutStatsProps) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing="md" className={styles.statsGrid}>
      <StatCard
        title="Total Workouts"
        value={stats.totalWorkouts}
        icon={<IconBarbell size={16} />}
        iconVariant="blue"
        description="In selected period"
        isLoading={stats.isLoading}
        animationDelay={0}
      />
      <StatCard
        title="This Week"
        value={stats.workoutsThisWeek}
        icon={<IconActivity size={16} />}
        iconVariant="teal"
        description="Workouts completed"
        isLoading={stats.isLoading}
        animationDelay={50}
      />
      <StatCard
        title="Current Streak"
        value={`${stats.currentStreak} days`}
        icon={<IconFlame size={16} />}
        iconVariant="orange"
        description="Keep it going!"
        isLoading={stats.isLoading}
        animationDelay={100}
      />
      <StatCard
        title="Avg Duration"
        value={formatDuration(stats.averageDuration)}
        icon={<IconClock size={16} />}
        iconVariant="violet"
        description="Per workout"
        isLoading={stats.isLoading}
        animationDelay={150}
      />
    </SimpleGrid>
  );
}
