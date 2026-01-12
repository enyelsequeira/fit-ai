import type { ReactNode } from "react";

import {
  IconApple,
  IconBarbell,
  IconBrain,
  IconBulb,
  IconChevronDown,
  IconHeartbeat,
  IconRefresh,
  IconSparkles,
} from "@tabler/icons-react";
import { useState } from "react";

import { ActionIcon, Badge, Box, Collapse, Flex, Stack, Text, Tooltip } from "@mantine/core";

import { FitAiButton } from "@/components/ui/button";
import { Card, FitAiCardContent, FitAiCardDescription, FitAiCardHeader, FitAiCardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./ai-insights.module.css";

type InsightType = "workout" | "recovery" | "nutrition" | "form" | "general";
type InsightPriority = "high" | "medium" | "low";

interface Insight {
  id: string;
  type: InsightType;
  title: string;
  content: string;
  priority: InsightPriority;
  actionLabel?: string;
  onAction?: () => void;
}

interface AIInsightsProps {
  insights: Insight[];
  isLoading?: boolean;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

const INSIGHT_TYPE_CONFIG: Record<InsightType, { icon: ReactNode; color: string; label: string }> =
  {
    workout: {
      icon: <IconBarbell size={16} />,
      color: "var(--mantine-color-blue-5)",
      label: "Workout",
    },
    recovery: {
      icon: <IconHeartbeat size={16} />,
      color: "var(--mantine-color-teal-5)",
      label: "Recovery",
    },
    nutrition: {
      icon: <IconApple size={16} />,
      color: "var(--mantine-color-green-5)",
      label: "Nutrition",
    },
    form: {
      icon: <IconBrain size={16} />,
      color: "var(--mantine-color-orange-5)",
      label: "Form",
    },
    general: {
      icon: <IconBulb size={16} />,
      color: "var(--mantine-color-grape-5)",
      label: "Tip",
    },
  };

const PRIORITY_CONFIG: Record<InsightPriority, { color: string; label: string }> = {
  high: { color: "red", label: "High Priority" },
  medium: { color: "yellow", label: "Medium" },
  low: { color: "gray", label: "Tip" },
};

function InsightCard({
  insight,
  index,
  defaultExpanded = false,
}: {
  insight: Insight;
  index: number;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const typeConfig = INSIGHT_TYPE_CONFIG[insight.type];
  const priorityConfig = PRIORITY_CONFIG[insight.priority];

  return (
    <Box
      className={styles.insightCard}
      style={
        {
          "--insight-accent-color": typeConfig.color,
          "--insight-delay": `${100 + index * 50}ms`,
        } as React.CSSProperties
      }
    >
      <Flex
        justify="space-between"
        align="flex-start"
        gap="sm"
        className={styles.insightHeader}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <Flex gap="sm" align="flex-start" style={{ flex: 1 }}>
          <Box className={styles.insightIcon} style={{ color: typeConfig.color }}>
            {typeConfig.icon}
          </Box>
          <Stack gap={4} style={{ flex: 1 }}>
            <Flex gap="xs" align="center" wrap="wrap">
              <Text fw={500} size="sm" lineClamp={isExpanded ? undefined : 1}>
                {insight.title}
              </Text>
              <Badge size="xs" variant="light" color={priorityConfig.color}>
                {priorityConfig.label}
              </Badge>
            </Flex>
            {!isExpanded && (
              <Text size="xs" c="dimmed" lineClamp={1}>
                {insight.content}
              </Text>
            )}
          </Stack>
        </Flex>
        <ActionIcon
          variant="subtle"
          size="sm"
          className={styles.expandButton}
          data-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse insight" : "Expand insight"}
        >
          <IconChevronDown size={16} />
        </ActionIcon>
      </Flex>

      <Collapse in={isExpanded}>
        <Stack gap="sm" className={styles.insightContent}>
          <Text size="sm" c="dimmed">
            {insight.content}
          </Text>
          {insight.actionLabel && insight.onAction && (
            <FitAiButton variant="outline" size="xs" onClick={insight.onAction}>
              {insight.actionLabel}
            </FitAiButton>
          )}
        </Stack>
      </Collapse>
    </Box>
  );
}

function LoadingSkeleton() {
  return (
    <Card className={styles.card}>
      <FitAiCardHeader>
        <Flex justify="space-between" align="center">
          <Stack gap="xs">
            <Skeleton h={20} w={140} />
            <Skeleton h={14} w={200} />
          </Stack>
          <Skeleton h={28} w={28} radius="sm" />
        </Flex>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Stack gap="sm">
          {Array.from({ length: 3 }).map((_, i) => (
            <Box key={i} className={styles.skeletonCard}>
              <Flex gap="sm" align="flex-start">
                <Skeleton h={32} w={32} radius="sm" />
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Skeleton h={16} w="70%" />
                  <Skeleton h={12} w="90%" />
                </Stack>
              </Flex>
            </Box>
          ))}
        </Stack>
      </FitAiCardContent>
    </Card>
  );
}

function EmptyState({ onRegenerate }: { onRegenerate?: () => void }) {
  return (
    <Stack py="md" gap="xs" align="center" ta="center" className={styles.emptyState}>
      <Box className={styles.emptyIcon}>
        <IconSparkles size={32} />
      </Box>
      <Text size="sm" fw={500}>No insights available</Text>
      <Text size="xs" c="dimmed">
        Generate personalized AI recommendations based on your training data
      </Text>
      {onRegenerate && (
        <FitAiButton size="sm" onClick={onRegenerate} leftSection={<IconSparkles size={14} />}>
          Generate Insights
        </FitAiButton>
      )}
    </Stack>
  );
}

export function AIInsights({
  insights,
  isLoading = false,
  onRegenerate,
  isRegenerating = false,
}: AIInsightsProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const hasInsights = insights.length > 0;

  return (
    <Card className={styles.card}>
      <FitAiCardHeader>
        <Flex justify="space-between" align="flex-start">
          <Stack gap={2}>
            <Flex gap="xs" align="center">
              <IconSparkles size={18} className={styles.headerSparkle} />
              <FitAiCardTitle>AI Insights</FitAiCardTitle>
            </Flex>
            <FitAiCardDescription>Personalized recommendations for you</FitAiCardDescription>
          </Stack>
          {hasInsights && onRegenerate && (
            <Tooltip label="Regenerate insights" position="left">
              <ActionIcon
                variant="subtle"
                onClick={onRegenerate}
                loading={isRegenerating}
                aria-label="Regenerate insights"
                className={styles.regenerateButton}
              >
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
          )}
        </Flex>
      </FitAiCardHeader>
      <FitAiCardContent>
        {hasInsights ? (
          <Stack gap="sm">
            {insights.map((insight, index) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                index={index}
                defaultExpanded={index === 0}
              />
            ))}
          </Stack>
        ) : (
          <EmptyState onRegenerate={onRegenerate} />
        )}
      </FitAiCardContent>
    </Card>
  );
}

export function AIInsightsSkeleton() {
  return <AIInsights insights={[]} isLoading={true} />;
}
