import type { MuscleData } from "./types";

import { Box, Flex, Stack, Text } from "@mantine/core";

import styles from "./muscle-balance.module.css";

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
      className={styles.legendItem}
      data-hovered={isHovered || undefined}
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

export interface LegendProps {
  data: MuscleData[];
  hoveredIndex: number | null;
  onHoverIndex: (index: number | null) => void;
}

export function Legend({ data, hoveredIndex, onHoverIndex }: LegendProps) {
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
