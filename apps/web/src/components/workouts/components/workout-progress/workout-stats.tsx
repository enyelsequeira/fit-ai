/**
 * WorkoutStats - Stats summary section for active workout
 * Displays key workout metrics in a compact grid layout
 */

import { Paper, SimpleGrid, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { IconBarbell, IconCheck, IconClock, IconFlame } from "@tabler/icons-react";
import styles from "./workout-stats.module.css";

interface WorkoutStatsProps {
  totalVolume: number;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  estimatedTimeRemaining?: number; // in minutes
}

interface StatCardData {
  label: string;
  value: string;
  icon: typeof IconBarbell;
  color: string;
  tooltip: string;
}

function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toLocaleString();
}

function formatTimeRemaining(minutes: number | undefined): string {
  if (minutes === undefined || minutes <= 0) {
    return "--";
  }
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours}h ${remainingMinutes}m`;
}

export function WorkoutStats({
  totalVolume,
  exerciseCount,
  completedSets,
  totalSets,
  estimatedTimeRemaining,
}: WorkoutStatsProps) {
  const stats: StatCardData[] = [
    {
      label: "Volume",
      value: formatVolume(totalVolume),
      icon: IconFlame,
      color: "orange",
      tooltip: `Total volume: ${totalVolume.toLocaleString()} (weight x reps)`,
    },
    {
      label: "Exercises",
      value: exerciseCount.toString(),
      icon: IconBarbell,
      color: "blue",
      tooltip: `${exerciseCount} exercise${exerciseCount !== 1 ? "s" : ""} in workout`,
    },
    {
      label: "Sets",
      value: `${completedSets}/${totalSets}`,
      icon: IconCheck,
      color: completedSets === totalSets && totalSets > 0 ? "green" : "blue",
      tooltip: `${completedSets} of ${totalSets} sets completed`,
    },
    {
      label: "Time Left",
      value: formatTimeRemaining(estimatedTimeRemaining),
      icon: IconClock,
      color: "gray",
      tooltip:
        estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0
          ? `Estimated ${Math.round(estimatedTimeRemaining)} minutes remaining`
          : "Time remaining not available",
    },
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" className={styles.grid}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Tooltip key={stat.label} label={stat.tooltip} position="bottom" withArrow>
            <Paper className={styles.statCard} p="sm" radius="md" withBorder>
              <div className={styles.statHeader}>
                <ThemeIcon
                  size="sm"
                  radius="sm"
                  variant="light"
                  color={stat.color}
                  className={styles.icon}
                >
                  <Icon size={14} />
                </ThemeIcon>
                <Text size="xs" c="dimmed" className={styles.label}>
                  {stat.label}
                </Text>
              </div>
              <Text size="lg" fw={700} className={styles.value}>
                {stat.value}
              </Text>
            </Paper>
          </Tooltip>
        );
      })}
    </SimpleGrid>
  );
}
