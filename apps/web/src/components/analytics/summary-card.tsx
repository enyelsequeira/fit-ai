/**
 * SummaryCard - Displays a single metric with icon, value, label and optional trend
 */

import type { ReactNode } from "react";

import { Center, Group, Stack, Text } from "@mantine/core";

import { FitAiCard, FitAiCardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./analytics-view.module.css";

export interface SummaryCardProps {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  value: number | string;
  label: string;
  trend?: number;
}

export function SummaryCard({ icon, iconBg, iconColor, value, label, trend }: SummaryCardProps) {
  return (
    <FitAiCard className={styles.summaryCard} data-card-type="summary">
      <FitAiCardContent>
        <Group gap="md" align="center" p="xs" wrap="nowrap">
          <Center
            w={40}
            h={40}
            className={styles.summaryIcon}
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            {icon}
          </Center>
          <Stack gap={0} flex={1}>
            <Group justify="space-between" align="center">
              <Text size="xl" fw={700}>
                {typeof value === "number" ? value.toLocaleString() : value}
              </Text>
              {trend !== undefined && trend !== 0 && (
                <Text size="xs" c={trend > 0 ? "teal" : "red"} fw={500}>
                  {trend > 0 ? "+" : ""}
                  {trend.toFixed(0)}%
                </Text>
              )}
            </Group>
            <Text size="xs" c="dimmed">
              {label}
            </Text>
          </Stack>
        </Group>
      </FitAiCardContent>
    </FitAiCard>
  );
}

export function SummaryCardSkeleton() {
  return (
    <FitAiCard data-loading="true">
      <FitAiCardContent>
        <Group gap="md" align="center" p="xs" wrap="nowrap">
          <Skeleton circle h={40} w={40} />
          <Stack gap={4} flex={1}>
            <Skeleton h={24} w={60} />
            <Skeleton h={14} w={100} />
          </Stack>
        </Group>
      </FitAiCardContent>
    </FitAiCard>
  );
}
