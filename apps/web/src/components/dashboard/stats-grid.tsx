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

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  isLoading?: boolean;
}

function StatCard({ title, value, description, icon, trend, isLoading }: StatCardProps) {
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

  return (
    <Card>
      <CardHeader>
        <Group justify="space-between" pb="xs">
          <CardTitle c="dimmed" fw={500}>
            {title}
          </CardTitle>
          <Box c="dimmed">{icon}</Box>
        </Group>
      </CardHeader>
      <CardContent>
        <Text fz={24} fw={700}>
          {value}
        </Text>
        {trend && (
          <Flex align="center" gap={4}>
            {trend.value > 0 ? (
              <IconArrowUp size={12} style={{ color: "rgb(34, 197, 94)" }} />
            ) : trend.value < 0 ? (
              <IconArrowDown size={12} style={{ color: "rgb(239, 68, 68)" }} />
            ) : null}
            <Text size="xs" c={trend.value > 0 ? "green" : trend.value < 0 ? "red" : "dimmed"}>
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

interface StatsGridProps {
  workoutsThisWeek: number;
  workoutsLastWeek?: number;
  currentStreak: number;
  longestStreak?: number;
  totalVolumeThisWeek: number;
  volumeLastWeek?: number;
  prsThisMonth: number;
  isLoading?: boolean;
}

export function StatsGrid({
  workoutsThisWeek,
  workoutsLastWeek,
  currentStreak,
  longestStreak,
  totalVolumeThisWeek,
  volumeLastWeek,
  prsThisMonth,
  isLoading,
}: StatsGridProps) {
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
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      <StatCard
        title="Workouts This Week"
        value={workoutsThisWeek}
        icon={<IconActivity size={16} />}
        trend={workoutTrend}
        isLoading={isLoading}
      />
      <StatCard
        title="Current Streak"
        value={`${currentStreak} days`}
        icon={<IconFlame size={16} />}
        description={longestStreak ? `Longest: ${longestStreak} days` : undefined}
        isLoading={isLoading}
      />
      <StatCard
        title="Volume This Week"
        value={formatVolume(totalVolumeThisWeek)}
        icon={<IconScale size={16} />}
        trend={volumeTrend}
        isLoading={isLoading}
      />
      <StatCard
        title="PRs This Month"
        value={prsThisMonth}
        icon={<IconTrophy size={16} />}
        description="Personal records achieved"
        isLoading={isLoading}
      />
    </SimpleGrid>
  );
}

export function StatsGridSkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCard key={i} title="" value="" icon={null} isLoading={true} />
      ))}
    </SimpleGrid>
  );
}
