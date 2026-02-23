/**
 * MeasurementsSummary - Summary statistics cards for body measurements
 * Embeddable in FitAiPageHeader.Stats or standalone
 */

import type { MeasurementsSummaryData } from "./types";

import { Center, Flex, Group, SimpleGrid, Text } from "@mantine/core";
import {
  IconCalendar,
  IconPercentage,
  IconScale,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";

import { FitAiCard, FitAiCardContent, FitAiCardHeader, FitAiCardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeDate } from "@/components/ui/utils";

import styles from "./measurements-summary.module.css";

type TrendDirection = "up" | "down" | "neutral";

function getTrendDirection(change: number | null | undefined): TrendDirection {
  if (change === null || change === undefined) return "neutral";
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "neutral";
}

interface StatCardProps {
  title: string;
  value: string | number | null;
  unit?: string;
  icon: React.ReactNode;
  iconVariant: "blue" | "orange" | "teal" | "violet" | "green" | "red";
  change?: number | null;
  changeUnit?: string;
  description?: string;
  isLoading?: boolean;
  animationDelay?: number;
}

function StatCard({
  title,
  value,
  unit,
  icon,
  iconVariant,
  change,
  changeUnit = "",
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

  const hasChange = change !== null && change !== undefined;
  const trendDirection = getTrendDirection(change);
  const ChangeIcon =
    trendDirection === "up" ? IconTrendingUp : trendDirection === "down" ? IconTrendingDown : null;

  return (
    <FitAiCard className={styles.statCard} style={{ animationDelay: `${animationDelay}ms` }}>
      <FitAiCardHeader>
        <Group justify="space-between" pb="xs">
          <FitAiCardTitle c="dimmed" fw={500}>
            {title}
          </FitAiCardTitle>
          <Center w={32} h={32} className={styles.iconWrapper} data-variant={iconVariant}>
            {icon}
          </Center>
        </Group>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Group gap="xs" align="baseline">
          <Text fz={24} fw={700}>
            {value !== null ? value : "--"}
          </Text>
          {unit && value !== null && (
            <Text size="sm" c="dimmed">
              {unit}
            </Text>
          )}
        </Group>
        {hasChange && (
          <Flex
            align="center"
            gap={4}
            mt={4}
            className={styles.trendIndicator}
            data-trend={trendDirection}
          >
            {ChangeIcon && (
              <ChangeIcon size={14} className={styles.trendIcon} data-trend={trendDirection} />
            )}
            <Text size="xs" fw={500} className={styles.changeText} data-trend={trendDirection}>
              {trendDirection === "up" ? "+" : ""}
              {change?.toFixed(1)}
              {changeUnit}
            </Text>
            <Text size="xs" c="dimmed">
              from last
            </Text>
          </Flex>
        )}
        {description && !hasChange && (
          <Text size="xs" c="dimmed" mt={4}>
            {description}
          </Text>
        )}
      </FitAiCardContent>
    </FitAiCard>
  );
}

interface MeasurementsSummaryProps {
  summary: MeasurementsSummaryData;
}

export function MeasurementsSummary({ summary }: MeasurementsSummaryProps) {
  const lastMeasuredLabel = summary.lastMeasuredAt
    ? formatRelativeDate(summary.lastMeasuredAt)
    : "Never";

  const weightTrend = getTrendDirection(summary.weightChange);

  return (
    <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing="md" className={styles.statsGrid}>
      <StatCard
        title="Current Weight"
        value={summary.currentWeight}
        unit={summary.weightUnit}
        icon={<IconScale size={16} />}
        iconVariant="blue"
        change={summary.weightChange}
        changeUnit={` ${summary.weightUnit}`}
        isLoading={summary.isLoading}
        animationDelay={0}
      />
      <StatCard
        title="Body Fat"
        value={summary.currentBodyFat}
        unit="%"
        icon={<IconPercentage size={16} />}
        iconVariant="orange"
        change={summary.bodyFatChange}
        changeUnit="%"
        isLoading={summary.isLoading}
        animationDelay={50}
      />
      <StatCard
        title="Measurements"
        value={summary.measurementCount}
        icon={<IconTrendingUp size={16} />}
        iconVariant="teal"
        description="In selected period"
        isLoading={summary.isLoading}
        animationDelay={100}
      />
      <StatCard
        title="Last Measured"
        value={lastMeasuredLabel}
        icon={<IconCalendar size={16} />}
        iconVariant={weightTrend === "up" ? "red" : "green"}
        description="Weight direction"
        isLoading={summary.isLoading}
        animationDelay={150}
      />
    </SimpleGrid>
  );
}
