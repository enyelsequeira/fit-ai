import { useMemo, useState } from "react";

import { IconAlertTriangle, IconChartDonut } from "@tabler/icons-react";

import { Alert, Box, Flex, SegmentedControl, Stack, Text, Tooltip } from "@mantine/core";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./muscle-balance.module.css";

export interface MuscleData {
  muscleGroup: string;
  volume: number;
  percentage: number;
  color: string;
}

export interface MuscleBalanceProps {
  data: MuscleData[];
  period: "week" | "month";
  onPeriodChange?: (period: "week" | "month") => void;
  hasImbalance?: boolean;
  imbalanceMessage?: string;
  isLoading?: boolean;
}

const CHART_SIZE = 160;
const STROKE_WIDTH = 24;
const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = CHART_SIZE / 2;

interface DonutSegmentProps {
  percentage: number;
  color: string;
  offset: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  muscleGroup: string;
  volume: number;
  index: number;
}

function DonutSegment({
  percentage,
  color,
  offset,
  isHovered,
  onHover,
  onLeave,
  muscleGroup,
  volume,
  index,
}: DonutSegmentProps) {
  const strokeDasharray = `${(percentage / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
  const strokeDashoffset = -offset;
  const strokeWidth = isHovered ? STROKE_WIDTH + 4 : STROKE_WIDTH;

  return (
    <Tooltip
      label={
        <Box>
          <Text size="sm" fw={500}>
            {muscleGroup}
          </Text>
          <Text size="xs" c="dimmed">
            {volume.toLocaleString()} kg ({percentage.toFixed(1)}%)
          </Text>
        </Box>
      }
      position="top"
      withArrow
    >
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className={styles.segment}
        style={{
          animationDelay: `${index * 100}ms`,
          opacity: isHovered ? 1 : 0.85,
        }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
      />
    </Tooltip>
  );
}

function DonutChart({
  data,
  hoveredIndex,
  onHoverIndex,
}: {
  data: MuscleData[];
  hoveredIndex: number | null;
  onHoverIndex: (index: number | null) => void;
}) {
  const segments = useMemo(() => {
    let currentOffset = 0;
    return data.map((item, index) => {
      const segment = {
        ...item,
        offset: currentOffset,
        index,
      };
      currentOffset += (item.percentage / 100) * CIRCUMFERENCE;
      return segment;
    });
  }, [data]);

  const totalVolume = useMemo(() => data.reduce((sum, d) => sum + d.volume, 0), [data]);

  return (
    <Box className={styles.chartContainer}>
      <svg
        width={CHART_SIZE}
        height={CHART_SIZE}
        viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
        className={styles.chart}
      >
        {/* Background circle */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--mantine-color-default-border)"
          strokeWidth={STROKE_WIDTH}
          opacity={0.3}
        />
        {/* Data segments */}
        {segments.map((segment, index) => (
          <DonutSegment
            key={segment.muscleGroup}
            percentage={segment.percentage}
            color={segment.color}
            offset={segment.offset}
            isHovered={hoveredIndex === index}
            onHover={() => onHoverIndex(index)}
            onLeave={() => onHoverIndex(null)}
            muscleGroup={segment.muscleGroup}
            volume={segment.volume}
            index={index}
          />
        ))}
      </svg>
      {/* Center content */}
      <Box className={styles.centerContent}>
        <Text size="xl" fw={700} lh={1}>
          {totalVolume >= 1000
            ? `${(totalVolume / 1000).toFixed(1)}k`
            : totalVolume.toLocaleString()}
        </Text>
        <Text size="xs" c="dimmed">
          kg total
        </Text>
      </Box>
    </Box>
  );
}

interface LegendItemProps {
  muscle: MuscleData;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  index: number;
}

function LegendItem({ muscle, isHovered, onHover, onLeave, index }: LegendItemProps) {
  return (
    <Flex
      align="center"
      gap="xs"
      className={`${styles.legendItem} ${isHovered ? styles.legendItemHovered : ""}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Box className={styles.legendColor} style={{ backgroundColor: muscle.color }} />
      <Text size="sm" className={styles.legendLabel} truncate>
        {muscle.muscleGroup}
      </Text>
      <Text size="sm" fw={500} ml="auto">
        {muscle.percentage.toFixed(0)}%
      </Text>
    </Flex>
  );
}

function Legend({
  data,
  hoveredIndex,
  onHoverIndex,
}: {
  data: MuscleData[];
  hoveredIndex: number | null;
  onHoverIndex: (index: number | null) => void;
}) {
  return (
    <Stack gap={6} className={styles.legend}>
      {data.map((muscle, index) => (
        <LegendItem
          key={muscle.muscleGroup}
          muscle={muscle}
          isHovered={hoveredIndex === index}
          onHover={() => onHoverIndex(index)}
          onLeave={() => onHoverIndex(null)}
          index={index}
        />
      ))}
    </Stack>
  );
}

function LoadingSkeleton() {
  return (
    <Card className={styles.card}>
      <CardHeader>
        <Flex justify="space-between" align="flex-start">
          <Box>
            <CardTitle>
              <Flex align="center" gap="xs">
                <IconChartDonut size={20} />
                Muscle Balance
              </Flex>
            </CardTitle>
            <CardDescription>Training volume distribution</CardDescription>
          </Box>
          <Skeleton h={32} w={140} />
        </Flex>
      </CardHeader>
      <CardContent>
        <Flex gap="lg" align="flex-start" wrap="wrap">
          <Skeleton h={CHART_SIZE} w={CHART_SIZE} radius="xl" />
          <Stack gap={6} style={{ flex: 1, minWidth: 140 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Flex key={i} align="center" gap="xs">
                <Skeleton h={12} w={12} radius="sm" />
                <Skeleton h={16} w={60} />
                <Skeleton h={16} w={32} ml="auto" />
              </Flex>
            ))}
          </Stack>
        </Flex>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Stack py="md" gap="xs" align="center" ta="center" className={styles.emptyState}>
      <Box className={styles.emptyIcon}>
        <IconChartDonut size={32} />
      </Box>
      <Text size="sm" fw={500}>No training data</Text>
      <Text size="xs" c="dimmed" maw={200}>
        Complete workouts to see your muscle balance distribution
      </Text>
    </Stack>
  );
}

export function MuscleBalance({
  data,
  period,
  onPeriodChange,
  hasImbalance,
  imbalanceMessage,
  isLoading,
}: MuscleBalanceProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const hasData = data.length > 0;

  return (
    <Card className={styles.card}>
      <CardHeader>
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Box>
            <CardTitle>
              <Flex align="center" gap="xs">
                <IconChartDonut size={20} className={styles.headerIcon} />
                Muscle Balance
              </Flex>
            </CardTitle>
            <CardDescription>Training volume distribution</CardDescription>
          </Box>
          <SegmentedControl
            size="xs"
            value={period}
            onChange={(value) => onPeriodChange?.(value as "week" | "month")}
            data={[
              { label: "This Week", value: "week" },
              { label: "This Month", value: "month" },
            ]}
            className={styles.periodControl}
          />
        </Flex>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <EmptyState />
        ) : (
          <>
            {hasImbalance && imbalanceMessage && (
              <Alert
                icon={<IconAlertTriangle size={18} />}
                color="yellow"
                variant="light"
                mb="md"
                className={styles.alert}
              >
                <Text size="sm">{imbalanceMessage}</Text>
              </Alert>
            )}
            <Flex gap="lg" align="flex-start" wrap="wrap">
              <DonutChart data={data} hoveredIndex={hoveredIndex} onHoverIndex={setHoveredIndex} />
              <Legend data={data} hoveredIndex={hoveredIndex} onHoverIndex={setHoveredIndex} />
            </Flex>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function MuscleBalanceSkeleton() {
  return <MuscleBalance data={[]} period="week" isLoading={true} />;
}

/** Default color palette for muscle groups */
export const MUSCLE_GROUP_COLORS: Record<string, string> = {
  Chest: "var(--mantine-color-blue-5)",
  Back: "var(--mantine-color-teal-5)",
  Shoulders: "var(--mantine-color-cyan-5)",
  Arms: "var(--mantine-color-indigo-5)",
  Legs: "var(--mantine-color-green-5)",
  Core: "var(--mantine-color-yellow-5)",
};

/** Helper to detect muscle imbalance */
export function detectMuscleImbalance(
  data: MuscleData[],
  threshold = 35,
): { hasImbalance: boolean; message?: string } {
  if (data.length < 2) {
    return { hasImbalance: false };
  }

  const maxPercentage = Math.max(...data.map((d) => d.percentage));
  const minPercentage = Math.min(...data.map((d) => d.percentage));
  const ratio = maxPercentage / Math.max(minPercentage, 1);

  if (ratio > 3) {
    const dominant = data.find((d) => d.percentage === maxPercentage);
    const neglected = data.find((d) => d.percentage === minPercentage);

    if (dominant && neglected) {
      return {
        hasImbalance: true,
        message: `${dominant.muscleGroup} is significantly overtrained compared to ${neglected.muscleGroup}. Consider balancing your routine.`,
      };
    }
  }

  if (maxPercentage > threshold) {
    const dominant = data.find((d) => d.percentage === maxPercentage);
    if (dominant) {
      return {
        hasImbalance: true,
        message: `${dominant.muscleGroup} accounts for ${maxPercentage.toFixed(0)}% of your training. Consider diversifying.`,
      };
    }
  }

  return { hasImbalance: false };
}
