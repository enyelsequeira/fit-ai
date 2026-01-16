import { Box, Flex, Group, SimpleGrid, Stack } from "@mantine/core";

import {
  Card,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { DAY_LABELS } from "./utils";

import styles from "./workout-frequency.module.css";

export function WorkoutFrequencySkeleton() {
  return (
    <Card className={styles.card}>
      <FitAiCardHeader>
        <Group justify="space-between">
          <Box>
            <FitAiCardTitle>Workout Frequency</FitAiCardTitle>
            <FitAiCardDescription>Last 30 days activity</FitAiCardDescription>
          </Box>
          <Skeleton h={32} w={32} radius="md" />
        </Group>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Stack gap="md">
          <SimpleGrid cols={3} spacing="xs">
            {Array.from({ length: 3 }).map((_, i) => (
              <Flex key={i} align="center" gap="xs">
                <Skeleton h={24} w={24} radius="sm" />
                <Stack gap={2}>
                  <Skeleton h={12} w={48} />
                  <Skeleton h={14} w={32} />
                </Stack>
              </Flex>
            ))}
          </SimpleGrid>

          <Stack gap="xs">
            <Flex gap={4}>
              {DAY_LABELS.map((label) => (
                <Box key={label} className={styles.dayLabel}>
                  <Skeleton h={10} w={20} />
                </Box>
              ))}
            </Flex>
            <Box className={styles.heatmapGrid}>
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} h={20} w={20} radius="sm" />
              ))}
            </Box>
          </Stack>

          <Flex justify="flex-end" align="center" gap="xs">
            <Skeleton h={12} w={32} />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} h={12} w={12} radius="xs" />
            ))}
            <Skeleton h={12} w={32} />
          </Flex>
        </Stack>
      </FitAiCardContent>
    </Card>
  );
}
