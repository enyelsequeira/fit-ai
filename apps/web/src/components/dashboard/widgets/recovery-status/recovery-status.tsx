import { IconBolt, IconClipboardCheck, IconMoon } from "@tabler/icons-react";

import { Box, Flex, Progress, RingProgress, SimpleGrid, Stack, Text } from "@mantine/core";

import { FitAiButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./recovery-status.module.css";

interface CheckIn {
  id: number;
  date: string;
  sleepHours: number | null;
  sleepQuality: number | null;
  energyLevel: number | null;
  stressLevel: number | null;
  sorenessLevel: number | null;
  mood: string | null;
}

interface ReadinessData {
  score: number;
  recommendation: string;
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

interface RecoveryStatusProps {
  readiness: ReadinessData | null;
  todayCheckIn: CheckIn | null;
  isLoading?: boolean;
  onLogCheckIn?: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "teal";
  if (score >= 40) return "yellow";
  return "red";
}

function getMoodEmoji(mood: string | null): string {
  const moods: Record<string, string> = {
    great: "Feeling Great",
    good: "Feeling Good",
    neutral: "Okay",
    low: "Feeling Low",
    bad: "Not Good",
  };
  return mood ? (moods[mood] ?? mood) : "-";
}

function FactorBar({ label, score }: { label: string; score: number | null }) {
  if (score === null) return null;

  return (
    <Stack gap={4}>
      <Flex justify="space-between">
        <Text size="xs" c="dimmed">
          {label}
        </Text>
        <Text size="xs">{score}%</Text>
      </Flex>
      <Progress
        value={score}
        size="xs"
        color={getScoreColor(score)}
        radius="xl"
        className={styles.progressBar}
      />
    </Stack>
  );
}

export function RecoveryStatus({
  readiness,
  todayCheckIn,
  isLoading,
  onLogCheckIn,
}: RecoveryStatusProps) {
  if (isLoading) {
    return (
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>Recovery Status</CardTitle>
          <CardDescription>Your training readiness</CardDescription>
        </CardHeader>
        <CardContent>
          <Stack gap="md">
            <Flex align="center" gap="md">
              <Skeleton h={80} w={80} radius="xl" />
              <Stack gap="xs">
                <Skeleton h={24} w={128} />
                <Skeleton h={16} w={192} />
              </Stack>
            </Flex>
            <Stack gap="sm">
              {Array.from({ length: 4 }).map((_, i) => (
                <Stack key={i} gap={4}>
                  <Skeleton h={12} w="100%" />
                  <Skeleton h={6} w="100%" />
                </Stack>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // No check-in logged today
  if (!readiness?.todayCheckIn && !todayCheckIn) {
    return (
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>Recovery Status</CardTitle>
          <CardDescription>Your training readiness</CardDescription>
        </CardHeader>
        <CardContent>
          <Stack py="xl" align="center" ta="center" className={styles.emptyState}>
            <Box className={styles.emptyIcon}>
              <IconClipboardCheck size={48} />
            </Box>
            <Text fw={500}>How are you feeling today?</Text>
            <Text size="sm" c="dimmed">
              Log your daily check-in to track recovery
            </Text>
            <FitAiButton onClick={onLogCheckIn} leftSection={<IconClipboardCheck size={16} />}>
              Log Check-in
            </FitAiButton>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const scoreColor = readiness ? getScoreColor(readiness.score) : "blue";

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>Recovery Status</CardTitle>
        <CardDescription>Your training readiness</CardDescription>
      </CardHeader>
      <CardContent>
        <Stack gap="md">
          {/* Readiness Score with Ring Progress */}
          {readiness && (
            <Flex align="center" gap="md">
              <RingProgress
                size={80}
                thickness={8}
                roundCaps
                sections={[{ value: readiness.score, color: scoreColor }]}
                label={
                  <Text fz="lg" fw={700} ta="center" c={scoreColor}>
                    {readiness.score}
                  </Text>
                }
                className={styles.ringProgress}
              />
              <Box>
                <Text fw={600} c={scoreColor}>
                  {readiness.recommendation}
                </Text>
                <Text size="sm" c="dimmed">
                  Training Readiness Score
                </Text>
              </Box>
            </Flex>
          )}

          {/* Factor Breakdown */}
          {readiness?.factors && (
            <Stack gap="xs">
              <FactorBar label="Sleep" score={readiness.factors.sleepScore} />
              <FactorBar label="Energy" score={readiness.factors.energyScore} />
              <FactorBar label="Recovery" score={readiness.factors.sorenessScore} />
              <FactorBar label="Stress" score={readiness.factors.stressScore} />
              <FactorBar label="Muscles" score={readiness.factors.muscleRecoveryScore} />
            </Stack>
          )}

          {/* Today's Check-in Summary */}
          {todayCheckIn && (
            <Box pt="md" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
              <Text size="xs" c="dimmed" fw={500} tt="uppercase" mb="xs">
                Today's Check-in
              </Text>
              <SimpleGrid cols={2} spacing="sm">
                {todayCheckIn.sleepHours && (
                  <Flex align="center" gap="xs">
                    <IconMoon size={16} style={{ color: "var(--mantine-color-dimmed)" }} />
                    <Text size="sm">{todayCheckIn.sleepHours}h sleep</Text>
                  </Flex>
                )}
                {todayCheckIn.energyLevel && (
                  <Flex align="center" gap="xs">
                    <IconBolt size={16} style={{ color: "var(--mantine-color-dimmed)" }} />
                    <Text size="sm">Energy: {todayCheckIn.energyLevel}/10</Text>
                  </Flex>
                )}
                {todayCheckIn.mood && (
                  <Text size="sm" c="dimmed" style={{ gridColumn: "span 2" }}>
                    {getMoodEmoji(todayCheckIn.mood)}
                  </Text>
                )}
              </SimpleGrid>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function RecoveryStatusSkeleton() {
  return <RecoveryStatus readiness={null} todayCheckIn={null} isLoading={true} />;
}
