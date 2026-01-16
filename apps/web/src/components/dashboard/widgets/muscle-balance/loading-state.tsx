import { IconChartDonut } from "@tabler/icons-react";

import { Box, Flex, Stack } from "@mantine/core";

import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { CHART_SIZE } from "./types";

import styles from "./muscle-balance.module.css";

export function LoadingSkeleton() {
  return (
    <FitAiCard className={styles.card}>
      <FitAiCardHeader>
        <Flex justify="space-between" align="flex-start">
          <Box>
            <FitAiCardTitle>
              <Flex align="center" gap="xs">
                <IconChartDonut size={20} />
                Muscle Balance
              </Flex>
            </FitAiCardTitle>
            <FitAiCardDescription>Training volume distribution</FitAiCardDescription>
          </Box>
          <Skeleton h={32} w={140} />
        </Flex>
      </FitAiCardHeader>
      <FitAiCardContent>
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
      </FitAiCardContent>
    </FitAiCard>
  );
}
