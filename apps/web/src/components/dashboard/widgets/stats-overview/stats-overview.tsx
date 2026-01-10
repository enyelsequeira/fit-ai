import type { ReactNode } from "react";

import {
  IconActivity,
  IconArrowDown,
  IconArrowUp,
  IconFlame,
  IconScale,
  IconTrophy,
} from "@tabler/icons-react";

import { Box, Flex, Group, SimpleGrid, Text } from "@mantine/core";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./stats-overview.module.css";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  iconVariant?: "blue" | "orange" | "teal" | "yellow";
  trend?: {
    value: number;
    label: string;
  };
  isLoading?: boolean;
  animationDelay?: number;
}

function StatCard({
  title,
  value,
  description,
  icon,
  iconVariant = "blue",
  trend,
  isLoading,
  animationDelay = 0,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Group justify="space-between" pb="xs">
            <Skeleton h={16} w={96} />
            <Skeleton h={16} w={16} />
          </Group>
        </CardHeader>
        <CardContent>
          <Skeleton h={32} w={64} mb={4} />
          <Skeleton h={12} w={128} />
        </CardContent>
      </Card>
    );
  }

  const iconBgClass = {
    blue: styles.iconBgBlue,
    orange: styles.iconBgOrange,
    teal: styles.iconBgTeal,
    yellow: styles.iconBgYellow,
  }[iconVariant];

  return (
    <Card className={styles.statCard} style={{ animationDelay: `${animationDelay}ms` }}>
      <CardHeader>
        <Group justify="space-between" pb="xs">
          <CardTitle c="dimmed" fw={500}>
            {title}
          </CardTitle>
          <Box className={`${styles.iconWrapper} ${iconBgClass}`}>{icon}</Box>
        </Group>
      </CardHeader>
      <CardContent>
        <Text fz={24} fw={700}>
          {value}
        </Text>
        {trend && (
          <Flex align="center" gap={4}>
            {trend.value > 0 ? (
              <IconArrowUp size={12} className={styles.trendPositive} />
            ) : trend.value < 0 ? (
              <IconArrowDown size={12} className={styles.trendNegative} />
            ) : null}
            <Text
              size="xs"
              className={
                trend.value > 0
                  ? styles.trendPositive
                  : trend.value < 0
                    ? styles.trendNegative
                    : styles.trendNeutral
              }
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}
            </Text>
            <Text size="xs" c="dimmed">
              {trend.label}
            </Text>
          </Flex>
        )}
        {description && !trend && (
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsOverviewProps {
  workoutsThisWeek: number;
  workoutsLastWeek?: number;
  currentStreak: number;
  longestStreak?: number;
  totalVolumeThisWeek: number;
  volumeLastWeek?: number;
  prsThisMonth: number;
  isLoading?: boolean;
}

export function StatsOverview({
  workoutsThisWeek,
  workoutsLastWeek,
  currentStreak,
  longestStreak,
  totalVolumeThisWeek,
  volumeLastWeek,
  prsThisMonth,
  isLoading,
}: StatsOverviewProps) {
  const workoutTrend =
    workoutsLastWeek !== undefined
      ? {
          value: workoutsThisWeek - workoutsLastWeek,
          label: "from last week",
        }
      : undefined;

  const volumeTrend =
    volumeLastWeek !== undefined && volumeLastWeek > 0
      ? {
          value: Math.round(((totalVolumeThisWeek - volumeLastWeek) / volumeLastWeek) * 100),
          label: "% from last week",
        }
      : undefined;

  const formatVolume = (volume: number): string => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k kg`;
    }
    return `${volume} kg`;
  };

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" className={styles.statsGrid}>
      <StatCard
        title="Workouts This Week"
        value={workoutsThisWeek}
        icon={<IconActivity size={16} />}
        iconVariant="blue"
        trend={workoutTrend}
        isLoading={isLoading}
        animationDelay={0}
      />
      <StatCard
        title="Current Streak"
        value={`${currentStreak} days`}
        icon={<IconFlame size={16} />}
        iconVariant="orange"
        description={longestStreak ? `Longest: ${longestStreak} days` : undefined}
        isLoading={isLoading}
        animationDelay={50}
      />
      <StatCard
        title="Volume This Week"
        value={formatVolume(totalVolumeThisWeek)}
        icon={<IconScale size={16} />}
        iconVariant="teal"
        trend={volumeTrend}
        isLoading={isLoading}
        animationDelay={100}
      />
      <StatCard
        title="PRs This Month"
        value={prsThisMonth}
        icon={<IconTrophy size={16} />}
        iconVariant="yellow"
        description="Personal records achieved"
        isLoading={isLoading}
        animationDelay={150}
      />
    </SimpleGrid>
  );
}

export function StatsOverviewSkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCard key={i} title="" value="" icon={null} isLoading={true} />
      ))}
    </SimpleGrid>
  );
}
