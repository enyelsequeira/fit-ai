import { IconActivity, IconFlame, IconScale, IconTrophy } from "@tabler/icons-react";

import { SimpleGrid } from "@mantine/core";

import styles from "../../shared/components/stats-overview.module.css";
import { useDashboardData } from "@/components/dashboard/shared/use-dashboard-data.ts";
import StatCard from "@/components/dashboard/shared/components/stats-card.tsx";

export function StatsOverview() {
  const dashboardData = useDashboardData();
  const stats = dashboardData?.stats;
  const isLoading = stats?.isLoading ?? true;
  const workoutsThisWeek = stats?.workoutsThisWeek;
  const workoutsLastWeek = stats?.workoutsLastWeek;
  const workoutTrend = {
    value: (workoutsThisWeek ?? 0) - (workoutsLastWeek ?? 0),
    label: "from last week",
  };

  const volumeTrend =
    dashboardData.stats.volumeLastWeek !== undefined && dashboardData.stats.volumeLastWeek > 0
      ? {
          value: Math.round(
            ((dashboardData.stats.totalVolumeThisWeek - dashboardData.stats.volumeLastWeek) /
              dashboardData.stats.volumeLastWeek) *
              100,
          ),
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
        value={dashboardData.stats.workoutsThisWeek}
        icon={<IconActivity size={16} />}
        iconVariant="blue"
        trend={workoutTrend || { value: 0, label: "" }}
        isLoading={isLoading}
        animationDelay={0}
      />
      <StatCard
        title="Current Streak"
        value={`${dashboardData.stats.currentStreak} days`}
        icon={<IconFlame size={16} />}
        iconVariant="orange"
        description={
          dashboardData.stats.longestStreak
            ? `Longest: ${dashboardData.stats.longestStreak} days`
            : undefined
        }
        isLoading={isLoading}
        animationDelay={50}
      />
      <StatCard
        title="Volume This Week"
        value={formatVolume(dashboardData.stats.totalVolumeThisWeek)}
        icon={<IconScale size={16} />}
        iconVariant="teal"
        trend={volumeTrend}
        isLoading={isLoading}
        animationDelay={100}
      />
      <StatCard
        title="PRs This Month"
        value={dashboardData.stats.prsThisMonth}
        icon={<IconTrophy size={16} />}
        iconVariant="yellow"
        description="Personal records achieved"
        isLoading={isLoading}
        animationDelay={150}
      />
    </SimpleGrid>
  );
}
