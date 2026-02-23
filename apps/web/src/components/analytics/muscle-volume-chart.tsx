/**
 * MuscleVolumeChart - Displays volume distribution by muscle group
 * Uses Mantine DonutChart for visualization
 */

import { IconActivity } from "@tabler/icons-react";
import { Box, Group, Stack, Text } from "@mantine/core";
import { DonutChart } from "@mantine/charts";

import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state-views";
import { formatVolume } from "@/components/ui/utils";
import type { MuscleVolumeData } from "./use-analytics-data";

import styles from "./analytics-view.module.css";

interface MuscleVolumeChartProps {
  data: MuscleVolumeData[];
  isLoading?: boolean;
}

export function MuscleVolumeChart({ data, isLoading }: MuscleVolumeChartProps) {
  const hasData = data.length > 0;

  if (isLoading) {
    return (
      <FitAiCard className={styles.chartCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>
            <Group gap="xs">
              <IconActivity size={20} />
              Volume by Muscle Group
            </Group>
          </FitAiCardTitle>
          <FitAiCardDescription>Distribution of training volume</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Box className={styles.chartContainer} data-loading="true" data-has-data="false">
            <Skeleton w="100%" h="100%" />
          </Box>
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  if (!hasData) {
    return (
      <FitAiCard className={styles.chartCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>
            <Group gap="xs">
              <IconActivity size={20} />
              Volume by Muscle Group
            </Group>
          </FitAiCardTitle>
          <FitAiCardDescription>Distribution of training volume</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <EmptyState
            icon={<IconActivity size={48} stroke={1.5} />}
            title="No muscle data"
            message="Complete workouts to see muscle volume distribution"
          />
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  const totalVolume = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <FitAiCard className={styles.chartCard} data-has-data={String(hasData)}>
      <FitAiCardHeader>
        <FitAiCardTitle>
          <Group gap="xs">
            <IconActivity size={20} />
            Volume by Muscle Group
          </Group>
        </FitAiCardTitle>
        <FitAiCardDescription>Total: {formatVolume(totalVolume)}</FitAiCardDescription>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Group className={styles.muscleChart} gap="md" align="center" wrap="wrap">
          <Box style={{ flexShrink: 0 }}>
            <DonutChart
              data={data}
              size={200}
              thickness={30}
              tooltipDataSource="segment"
              chartLabel={formatVolume(totalVolume)}
            />
          </Box>

          {/* Legend */}
          <Stack gap="xs" flex={1} maw={300}>
            {data.slice(0, 8).map((item) => {
              const percentage = totalVolume > 0 ? (item.value / totalVolume) * 100 : 0;
              return (
                <Group key={item.name} justify="space-between" gap="xs" wrap="nowrap">
                  <Group align="center" gap="xs" wrap="nowrap">
                    <Box
                      w={8}
                      h={8}
                      style={{
                        borderRadius: "50%",
                        backgroundColor: item.color,
                      }}
                    />
                    <Text size="xs">{item.name}</Text>
                  </Group>
                  <Group gap="xs" align="center" wrap="nowrap">
                    <Text size="xs" fw={500}>
                      {formatVolume(item.value)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      ({percentage.toFixed(1)}%)
                    </Text>
                  </Group>
                </Group>
              );
            })}
            {data.length > 8 && (
              <Text size="xs" c="dimmed" mt="xs">
                +{data.length - 8} more muscle groups
              </Text>
            )}
          </Stack>
        </Group>
      </FitAiCardContent>
    </FitAiCard>
  );
}
