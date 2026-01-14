/**
 * PRSummary - Summary statistics for personal records
 */

import { IconBarbell, IconCalendarMonth, IconMedal, IconTrophy } from "@tabler/icons-react";
import { Card, Group, SimpleGrid, Skeleton, Stack, Text, ThemeIcon } from "@mantine/core";
import styles from "./pr-summary.module.css";

interface PRSummaryStats {
  totalRecords: number;
  exercisesWithRecords: number;
  countByType: Record<string, number>;
  prsThisMonth: number;
  isLoading: boolean;
}

interface PRSummaryProps {
  stats: PRSummaryStats;
}

type StatType = "total" | "month" | "exercises" | "strength";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  statType: StatType;
  isLoading?: boolean;
  highlight?: boolean;
}

function StatCard({
  icon,
  label,
  value,
  color,
  statType,
  isLoading,
  highlight = false,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card padding="md" radius="md" className={styles.statCard} data-stat-type={statType}>
        <Group gap="sm" wrap="nowrap">
          <Skeleton height={44} width={44} radius="md" />
          <Stack gap={4}>
            <Skeleton height={12} width={80} />
            <Skeleton height={24} width={60} />
          </Stack>
        </Group>
      </Card>
    );
  }

  return (
    <Card
      padding="md"
      radius="md"
      className={styles.statCard}
      data-stat-type={statType}
      data-highlight={highlight}
    >
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon size={44} radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
            {label}
          </Text>
          <Text size="xl" fw={700} lh={1}>
            {value}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}

export function PRSummary({ stats }: PRSummaryProps) {
  const { totalRecords, exercisesWithRecords, prsThisMonth, isLoading } = stats;

  // Calculate strength PRs (1RM + max weight)
  const strengthPRs =
    (stats.countByType["one_rep_max"] ?? 0) + (stats.countByType["max_weight"] ?? 0);

  // Highlight this month's stats if there are recent PRs
  const hasRecentPRs = prsThisMonth > 0;

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" className={styles.container}>
      <StatCard
        icon={<IconTrophy size={22} />}
        label="Total PRs"
        value={totalRecords}
        color="yellow"
        statType="total"
        isLoading={isLoading}
      />
      <StatCard
        icon={<IconCalendarMonth size={22} />}
        label="This Month"
        value={prsThisMonth}
        color="green"
        statType="month"
        isLoading={isLoading}
        highlight={hasRecentPRs}
      />
      <StatCard
        icon={<IconBarbell size={22} />}
        label="Exercises"
        value={exercisesWithRecords}
        color="blue"
        statType="exercises"
        isLoading={isLoading}
      />
      <StatCard
        icon={<IconMedal size={22} />}
        label="Strength PRs"
        value={strengthPRs}
        color="violet"
        statType="strength"
        isLoading={isLoading}
      />
    </SimpleGrid>
  );
}
