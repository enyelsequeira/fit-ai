/**
 * ReadinessScoreCard - Displays training readiness score with RingProgress
 * Shows overall score, recommendation, and factor breakdown
 * Uses data attributes for theme-aware styling
 */

import {
  Badge,
  Box,
  Card,
  Flex,
  Group,
  RingProgress,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { IconAlertCircle, IconCheck, IconMinus } from "@tabler/icons-react";
import styles from "./recovery-view.module.css";

interface ReadinessData {
  score: number;
  recommendation: "ready to train hard" | "light training recommended" | "rest day suggested";
  factors: {
    sleepScore: number | null;
    energyScore: number | null;
    sorenessScore: number | null;
    stressScore: number | null;
    muscleRecoveryScore: number | null;
  };
  todayCheckIn: boolean;
  lastCheckInDate: string | null;
}

interface ReadinessScoreCardProps {
  readiness: ReadinessData | null;
  isLoading?: boolean;
}

type ReadinessLevel = "high" | "medium" | "low" | "none";
type ScoreLevel = "high" | "medium" | "low" | "none";

function getReadinessLevel(score: number | null): ReadinessLevel {
  if (score === null) return "none";
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function getScoreLevel(score: number | null): ScoreLevel {
  if (score === null) return "none";
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function getScoreColor(score: number): string {
  if (score >= 70) return "teal";
  if (score >= 40) return "yellow";
  return "red";
}

function getRecommendationIcon(recommendation: ReadinessData["recommendation"]) {
  switch (recommendation) {
    case "ready to train hard":
      return <IconCheck size={14} />;
    case "light training recommended":
      return <IconMinus size={14} />;
    case "rest day suggested":
      return <IconAlertCircle size={14} />;
  }
}

function getRecommendationColor(recommendation: ReadinessData["recommendation"]) {
  switch (recommendation) {
    case "ready to train hard":
      return "teal";
    case "light training recommended":
      return "yellow";
    case "rest day suggested":
      return "red";
  }
}

function FactorItem({ label, value }: { label: string; value: number | null }) {
  const displayValue = value ?? 0;
  const scoreLevel = getScoreLevel(value);

  return (
    <Box className={styles.factorItem}>
      <Box className={styles.factorCircle} data-score-level={scoreLevel}>
        {value !== null ? displayValue : "-"}
      </Box>
      <Text fz={10} c="dimmed" ta="center" lh={1.2}>
        {label}
      </Text>
    </Box>
  );
}

function ReadinessScoreCard({ readiness, isLoading = false }: ReadinessScoreCardProps) {
  if (isLoading) {
    return (
      <Card withBorder>
        <Card.Section withBorder inheritPadding py="sm">
          <Text fz="sm" fw={500}>
            Training Readiness
          </Text>
        </Card.Section>
        <Card.Section inheritPadding py="lg">
          <Stack align="center" gap="md">
            <Skeleton height={140} width={140} circle />
            <Skeleton height={24} width={180} />
            <Skeleton height={40} width="100%" />
          </Stack>
        </Card.Section>
      </Card>
    );
  }

  const readinessLevel = getReadinessLevel(readiness?.score ?? null);

  if (!readiness) {
    return (
      <Card withBorder className={styles.readinessCard} data-readiness="none">
        <Card.Section withBorder inheritPadding py="sm">
          <Text fz="sm" fw={500}>
            Training Readiness
          </Text>
        </Card.Section>
        <Card.Section inheritPadding py="lg">
          <Stack align="center" gap="sm">
            <Text c="dimmed" fz="sm" ta="center">
              Complete your daily check-in to see your training readiness score.
            </Text>
          </Stack>
        </Card.Section>
      </Card>
    );
  }

  const color = getScoreColor(readiness.score);
  const recommendationColor = getRecommendationColor(readiness.recommendation);
  const recommendationIcon = getRecommendationIcon(readiness.recommendation);

  return (
    <Card withBorder className={styles.readinessCard} data-readiness={readinessLevel}>
      <Card.Section withBorder inheritPadding py="sm">
        <Group justify="space-between">
          <Text fz="sm" fw={500}>
            Training Readiness
          </Text>
          {!readiness.todayCheckIn && (
            <Badge size="xs" variant="light" color="yellow">
              No check-in today
            </Badge>
          )}
        </Group>
      </Card.Section>
      <Card.Section inheritPadding py="lg">
        <Stack align="center" gap="md">
          {/* Ring Progress with Score */}
          <RingProgress
            size={140}
            thickness={12}
            roundCaps
            sections={[{ value: readiness.score, color }]}
            label={
              <Flex direction="column" align="center" justify="center">
                <Text
                  fz={32}
                  fw={700}
                  c={color}
                  className={styles.readinessHighlight}
                  ff="var(--mantine-font-family-monospace)"
                >
                  {readiness.score}
                </Text>
                <Text fz="xs" c="dimmed">
                  / 100
                </Text>
              </Flex>
            }
          />

          {/* Recommendation Badge */}
          <Badge
            size="lg"
            variant="light"
            color={recommendationColor}
            leftSection={recommendationIcon}
            tt="capitalize"
          >
            {readiness.recommendation}
          </Badge>

          {/* Factor Breakdown */}
          <Box w="100%" pt="sm">
            <SimpleGrid cols={5} spacing="xs">
              <FactorItem label="Sleep" value={readiness.factors.sleepScore} />
              <FactorItem label="Energy" value={readiness.factors.energyScore} />
              <FactorItem label="Soreness" value={readiness.factors.sorenessScore} />
              <FactorItem label="Stress" value={readiness.factors.stressScore} />
              <FactorItem label="Recovery" value={readiness.factors.muscleRecoveryScore} />
            </SimpleGrid>
          </Box>

          {/* Last check-in info */}
          {readiness.lastCheckInDate && !readiness.todayCheckIn && (
            <Text fz="xs" c="dimmed">
              Last check-in: {readiness.lastCheckInDate}
            </Text>
          )}
        </Stack>
      </Card.Section>
    </Card>
  );
}

export { ReadinessScoreCard };
export type { ReadinessData };
