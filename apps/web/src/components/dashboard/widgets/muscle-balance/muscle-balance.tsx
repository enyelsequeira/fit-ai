import type { MuscleBalanceProps } from "./types";

import { useState } from "react";

import { IconAlertTriangle, IconChartDonut } from "@tabler/icons-react";

import { Alert, Box, Flex, SegmentedControl, Text } from "@mantine/core";

import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";

import { DonutChart } from "./donut-chart";
import { EmptyState } from "./empty-state";
import { Legend } from "./legend";
import { LoadingSkeleton } from "./loading-state";

import styles from "./muscle-balance.module.css";

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
    <FitAiCard className={styles.card}>
      <FitAiCardHeader>
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Box>
            <FitAiCardTitle>
              <Flex align="center" gap="xs">
                <IconChartDonut size={20} className={styles.headerIcon} />
                Muscle Balance
              </Flex>
            </FitAiCardTitle>
            <FitAiCardDescription>Training volume distribution</FitAiCardDescription>
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
      </FitAiCardHeader>
      <FitAiCardContent>
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
      </FitAiCardContent>
    </FitAiCard>
  );
}

export function MuscleBalanceSkeleton() {
  return <LoadingSkeleton />;
}

// Re-export types and utilities for external use
export type { MuscleBalanceProps, MuscleData } from "./types";
export { MUSCLE_GROUP_COLORS } from "./types";
export { detectMuscleImbalance } from "./utils";
