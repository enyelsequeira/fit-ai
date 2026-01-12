import styles from "@/components/dashboard/shared/components/stats-overview.module.css";
import { Box, Flex, Group, Text } from "@mantine/core";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { FitAiCard, FitAiCardContent, FitAiCardHeader, FitAiCardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  iconVariant?: "blue" | "orange" | "teal" | "yellow";
  trend?: {
    value: number;
    label: string;
  };
  isLoading?: boolean;
  animationDelay?: number;
}

function StatCard({
  title,
  value,
  description,
  icon,
  iconVariant = "blue",
  trend,
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

  return (
    <FitAiCard className={styles.statCard} style={{ animationDelay: `${animationDelay}ms` }}>
      <FitAiCardHeader>
        <Group justify="space-between" pb="xs">
          <FitAiCardTitle c="dimmed" fw={500}>
            {title}
          </FitAiCardTitle>
          <Box
            className={styles.iconWrapper}
            mod={{
              icon: iconVariant,
            }}
          >
            {icon}
          </Box>
        </Group>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Text fz={24} fw={700}>
          {value}
        </Text>
        {trend && (
          <Flex align="center" gap={4}>
            {trend.value > 0 ? (
              <IconArrowUp size={12} className={styles.trendPositive} />
            ) : trend.value < 0 ? (
              <IconArrowDown size={12} className={styles.trendNegative} />
            ) : null}
            <Text
              size="xs"
              className={
                trend.value > 0
                  ? styles.trendPositive
                  : trend.value < 0
                    ? styles.trendNegative
                    : styles.trendNeutral
              }
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}
            </Text>
            <Text size="xs" c="dimmed">
              {trend.label}
            </Text>
          </Flex>
        )}
        {description && !trend && (
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        )}
      </FitAiCardContent>
    </FitAiCard>
  );
}

export default StatCard;
