/**
 * MuscleRecoveryMap - Displays recovery status for each muscle group
 * Uses Mantine components with data attributes for theme-aware styling
 */

import {
  Badge,
  Box,
  Card,
  Group,
  Progress,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { IconActivity } from "@tabler/icons-react";
import { EmptyState } from "@/components/ui/state-views";
import styles from "./recovery-view.module.css";

interface MuscleRecoveryStatus {
  muscleGroup: string;
  recoveryScore: number | null;
  fatigueLevel: number | null;
  lastWorkedAt: Date | null;
  setsLast7Days: number;
  volumeLast7Days: number;
  estimatedFullRecovery: Date | null;
  updatedAt: Date;
}

interface MuscleRecoveryMapProps {
  muscleGroups: MuscleRecoveryStatus[];
  overallRecovery?: number;
  isLoading?: boolean;
}

type RecoveryLevel = "high" | "good" | "medium" | "low" | "critical";
type RecoveryStatus = "recovered" | "recovering" | "fatigued";

function getRecoveryLevel(score: number | null): RecoveryLevel {
  if (score === null) return "high";
  if (score >= 80) return "high";
  if (score >= 60) return "good";
  if (score >= 40) return "medium";
  if (score >= 20) return "low";
  return "critical";
}

function getRecoveryStatus(score: number | null): RecoveryStatus {
  if (score === null) return "recovered";
  if (score >= 70) return "recovered";
  if (score >= 40) return "recovering";
  return "fatigued";
}

function getRecoveryColor(score: number | null): string {
  if (score === null) return "gray";
  if (score >= 80) return "teal";
  if (score >= 60) return "green";
  if (score >= 40) return "yellow";
  if (score >= 20) return "orange";
  return "red";
}

function formatTimeAgo(date: Date | null): string {
  if (!date) return "Never";

  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "Today";
}

function formatTimeUntil(date: Date | null): string {
  if (!date) return "Recovered";

  const now = new Date();
  const diff = new Date(date).getTime() - now.getTime();

  if (diff <= 0) return "Recovered";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return "< 1h";
}

function formatMuscleName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function MuscleRecoveryItem({ muscle }: { muscle: MuscleRecoveryStatus }) {
  const score = muscle.recoveryScore ?? 100;
  const color = getRecoveryColor(muscle.recoveryScore);
  const recoveryLevel = getRecoveryLevel(muscle.recoveryScore);

  return (
    <Box className={styles.muscleItem} data-recovery-level={recoveryLevel}>
      <Stack gap="xs">
        <Group justify="space-between">
          <Text fz="sm" fw={500} tt="capitalize">
            {formatMuscleName(muscle.muscleGroup)}
          </Text>
          <Badge size="sm" color={color} variant="light" ff="var(--mantine-font-family-monospace)">
            {score}%
          </Badge>
        </Group>

        <Progress value={score} size="sm" color={color} />

        <Group justify="space-between" gap="xs">
          <Text fz={10} c="dimmed">
            Last: {formatTimeAgo(muscle.lastWorkedAt)}
          </Text>
          <Text fz={10} c="dimmed" ff="var(--mantine-font-family-monospace)">
            {muscle.setsLast7Days} sets / 7d
          </Text>
          {muscle.recoveryScore !== null && muscle.recoveryScore < 100 && (
            <Text fz={10} c="dimmed">
              Full: {formatTimeUntil(muscle.estimatedFullRecovery)}
            </Text>
          )}
        </Group>
      </Stack>
    </Box>
  );
}

function MuscleRecoveryMap({
  muscleGroups,
  overallRecovery,
  isLoading = false,
}: MuscleRecoveryMapProps) {
  if (isLoading) {
    return (
      <Card withBorder>
        <Card.Section withBorder inheritPadding py="sm">
          <Text fz="sm" fw={500}>
            Muscle Recovery Status
          </Text>
        </Card.Section>
        <Card.Section inheritPadding py="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
            <Skeleton height={80} />
            <Skeleton height={80} />
            <Skeleton height={80} />
            <Skeleton height={80} />
          </SimpleGrid>
        </Card.Section>
      </Card>
    );
  }

  if (muscleGroups.length === 0) {
    return (
      <Card withBorder>
        <Card.Section withBorder inheritPadding py="sm">
          <Text fz="sm" fw={500}>
            Muscle Recovery Status
          </Text>
        </Card.Section>
        <Card.Section inheritPadding py="lg">
          <EmptyState
            icon={<IconActivity size={48} stroke={1.5} />}
            title="No recovery data"
            message="No muscle recovery data available. Complete some workouts to see your recovery status."
          />
        </Card.Section>
      </Card>
    );
  }

  // Sort by recovery score (lowest first to highlight areas needing rest)
  const sorted = [...muscleGroups].sort((a, b) => {
    const aScore = a.recoveryScore ?? 100;
    const bScore = b.recoveryScore ?? 100;
    return aScore - bScore;
  });

  // Calculate overall recovery if not provided
  const calculatedOverall =
    overallRecovery ??
    Math.round(
      muscleGroups.reduce((sum, m) => sum + (m.recoveryScore ?? 100), 0) / muscleGroups.length,
    );

  const overallColor = getRecoveryColor(calculatedOverall);
  const overallStatus = getRecoveryStatus(calculatedOverall);

  return (
    <Card withBorder className={styles.recoveryStatusCard} data-recovery-status={overallStatus}>
      <Card.Section withBorder inheritPadding py="sm">
        <Group justify="space-between">
          <Text fz="sm" fw={500}>
            Muscle Recovery Status
          </Text>
          <Badge color={overallColor} variant="light" ff="var(--mantine-font-family-monospace)">
            {calculatedOverall}% Overall
          </Badge>
        </Group>
      </Card.Section>
      <Card.Section inheritPadding py="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
          {sorted.map((muscle) => (
            <MuscleRecoveryItem key={muscle.muscleGroup} muscle={muscle} />
          ))}
        </SimpleGrid>
      </Card.Section>
    </Card>
  );
}

export { MuscleRecoveryMap };
export type { MuscleRecoveryStatus };
