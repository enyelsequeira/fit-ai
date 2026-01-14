/**
 * GoalsSummary - Summary statistics cards for goals
 * Displays key metrics like active goals, completed, average progress
 */

import { Center, Group, SimpleGrid, Skeleton, Text } from "@mantine/core";
import { IconCheck, IconChartLine, IconClock, IconTarget } from "@tabler/icons-react";
import { FitAiCard, FitAiCardContent, FitAiCardHeader, FitAiCardTitle } from "@/components/ui/card";
import type { GoalsStats } from "./types";
import styles from "./goals-view.module.css";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconVariant: "green" | "blue" | "orange" | "violet";
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
            <Skeleton h={16} w={96} radius="sm" />
            <Skeleton h={32} w={32} radius="md" />
          </Group>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Skeleton h={32} w={64} mb={4} radius="sm" />
          <Skeleton h={12} w={128} radius="sm" />
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  return (
    <FitAiCard className={styles.statCard} style={{ animationDelay: `${animationDelay}ms` }}>
      <FitAiCardHeader>
        <Group justify="space-between" pb="xs">
          <FitAiCardTitle c="dimmed" fw={500} fz="sm">
            {title}
          </FitAiCardTitle>
          <Center className={styles.iconWrapper} data-variant={iconVariant}>
            {icon}
          </Center>
        </Group>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Text fz={24} fw={700} lh={1.2}>
          {value}
        </Text>
        {description && (
          <Text size="xs" c="dimmed" mt={4}>
            {description}
          </Text>
        )}
      </FitAiCardContent>
    </FitAiCard>
  );
}

interface GoalsSummaryProps {
  stats: GoalsStats;
}

export function GoalsSummary({ stats }: GoalsSummaryProps) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing="md" className={styles.statsGrid}>
      <StatCard
        title="Active Goals"
        value={stats.activeGoals}
        icon={<IconTarget size={16} />}
        iconVariant="green"
        description="Currently tracking"
        isLoading={stats.isLoading}
        animationDelay={0}
      />
      <StatCard
        title="Completed"
        value={stats.completedGoals}
        icon={<IconCheck size={16} />}
        iconVariant="blue"
        description="Goals achieved"
        isLoading={stats.isLoading}
        animationDelay={50}
      />
      <StatCard
        title="Avg Progress"
        value={`${Math.round(stats.averageProgress)}%`}
        icon={<IconChartLine size={16} />}
        iconVariant="violet"
        description="Across active goals"
        isLoading={stats.isLoading}
        animationDelay={100}
      />
      <StatCard
        title="Near Deadline"
        value={stats.nearDeadlineCount}
        icon={<IconClock size={16} />}
        iconVariant="orange"
        description="Goals ending soon"
        isLoading={stats.isLoading}
        animationDelay={150}
      />
    </SimpleGrid>
  );
}
