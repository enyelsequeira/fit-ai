import type { MuscleData } from "./types";

import { useMemo } from "react";

import { Box, Text, Tooltip } from "@mantine/core";

import { CENTER, CHART_SIZE, CIRCUMFERENCE, RADIUS, STROKE_WIDTH } from "./types";
import { calculateSegments, calculateTotalVolume, formatVolume } from "./utils";

import styles from "./muscle-balance.module.css";

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

export interface DonutChartProps {
  data: MuscleData[];
  hoveredIndex: number | null;
  onHoverIndex: (index: number | null) => void;
}

export function DonutChart({ data, hoveredIndex, onHoverIndex }: DonutChartProps) {
  const segments = useMemo(() => calculateSegments(data), [data]);
  const totalVolume = useMemo(() => calculateTotalVolume(data), [data]);

  return (
    <Box className={styles.chartContainer}>
      <svg
        width={CHART_SIZE}
        height={CHART_SIZE}
        viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
        className={styles.chart}
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--mantine-color-default-border)"
          strokeWidth={STROKE_WIDTH}
          opacity={0.3}
        />
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
      <Box className={styles.centerContent}>
        <Text size="xl" fw={700} lh={1}>
          {formatVolume(totalVolume)}
        </Text>
        <Text size="xs" c="dimmed">
          kg total
        </Text>
      </Box>
    </Box>
  );
}
