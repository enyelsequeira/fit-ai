/**
 * WorkoutsStatsRow - Stats summary row for workouts header
 * Shows key metrics in a responsive grid
 */

import { Skeleton, Tooltip } from "@mantine/core";
import { IconBarbell, IconCheck, IconPlayerPlay, IconCalendarWeek } from "@tabler/icons-react";
import styles from "./workouts-stats-row.module.css";

interface WorkoutsStatsRowProps {
  stats: {
    totalWorkouts: number;
    completedWorkouts: number;
    inProgressWorkouts: number;
    thisWeekCount: number;
    isLoading: boolean;
  };
  isLoading?: boolean;
}

export function WorkoutsStatsRow({ stats, isLoading }: WorkoutsStatsRowProps) {
  const loading = isLoading || stats.isLoading;

  const statItems = [
    {
      label: "Total Workouts",
      value: stats.totalWorkouts,
      icon: IconBarbell,
      color: "blue" as const,
      tooltip: "Total number of workouts",
    },
    {
      label: "Completed",
      value: stats.completedWorkouts,
      icon: IconCheck,
      color: "green" as const,
      tooltip: "Workouts marked as completed",
    },
    {
      label: "In Progress",
      value: stats.inProgressWorkouts,
      icon: IconPlayerPlay,
      color: "orange" as const,
      tooltip: "Workouts currently in progress",
    },
    {
      label: "This Week",
      value: stats.thisWeekCount,
      icon: IconCalendarWeek,
      color: "blue" as const,
      tooltip: "Workouts started this week",
    },
  ];

  if (loading) {
    return (
      <div className={styles.statsRow}>
        {statItems.map((item, index) => (
          <div key={index} className={styles.statCard}>
            <Skeleton height={40} width={40} radius="md" />
            <div className={styles.statContent}>
              <Skeleton height={20} width={40} radius="sm" />
              <Skeleton height={12} width={60} radius="sm" mt={4} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.statsRow}>
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Tooltip key={item.label} label={item.tooltip} position="bottom" withArrow>
            <div className={styles.statCard}>
              <div className={styles.statIcon} data-color={item.color}>
                <Icon size={20} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{item.value}</span>
                <span className={styles.statLabel}>{item.label}</span>
              </div>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}
