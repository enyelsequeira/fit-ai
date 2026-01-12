import { IconMedal, IconTrophy } from "@tabler/icons-react";

import { Box, Flex, Group, Stack, Text } from "@mantine/core";

import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./recent-prs.module.css";

interface PersonalRecord {
  id: number;
  exerciseName: string;
  recordType: string;
  value: number;
  displayUnit: string | null;
  achievedAt: Date;
}

interface RecentPRsProps {
  records: PersonalRecord[];
  isLoading?: boolean;
  onRecordClick?: (recordId: number) => void;
}

function formatRecordType(type: string): string {
  const types: Record<string, string> = {
    one_rep_max: "1RM",
    max_weight: "Max Weight",
    max_reps: "Max Reps",
    max_volume: "Max Volume",
    best_time: "Best Time",
    longest_duration: "Duration",
    longest_distance: "Distance",
  };
  return types[type] ?? type;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatValue(value: number, recordType: string, unit: string | null): string {
  if (recordType === "max_reps") {
    return `${value} reps`;
  }
  if (recordType === "best_time" || recordType === "longest_duration") {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }
  if (recordType === "longest_distance") {
    return value >= 1000 ? `${(value / 1000).toFixed(2)} km` : `${value} m`;
  }
  return `${value} ${unit ?? "kg"}`;
}

function PRItem({
  record,
  onClick,
  index,
}: {
  record: PersonalRecord;
  onClick?: () => void;
  index: number;
}) {
  return (
    <Flex
      align="center"
      gap="sm"
      p="xs"
      className={styles.prItem}
      onClick={onClick}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Flex h={32} w={32} align="center" justify="center" className={styles.medalIcon}>
        <IconMedal size={16} />
      </Flex>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm" fw={500} truncate>
          {record.exerciseName}
        </Text>
        <Text size="xs" c="dimmed">
          {formatRecordType(record.recordType)}
        </Text>
      </Box>
      <Box ta="right">
        <Text size="sm" fw={600}>
          {formatValue(record.value, record.recordType, record.displayUnit)}
        </Text>
        <Text size="xs" c="dimmed">
          {formatDate(record.achievedAt)}
        </Text>
      </Box>
    </Flex>
  );
}

function PRItemSkeleton() {
  return (
    <Flex align="center" gap="sm" p="xs">
      <Skeleton h={32} w={32} radius="xl" />
      <Box style={{ flex: 1 }}>
        <Skeleton h={16} w={96} mb={4} />
        <Skeleton h={12} w={64} />
      </Box>
      <Box ta="right">
        <Skeleton h={16} w={64} mb={4} />
        <Skeleton h={12} w={48} />
      </Box>
    </Flex>
  );
}

export function RecentPRs({ records, isLoading, onRecordClick }: RecentPRsProps) {
  return (
    <FitAiCard className={styles.card}>
      <FitAiCardHeader>
        <FitAiCardTitle>
          <Group gap="xs">
            <IconTrophy size={20} className={styles.trophyIcon} />
            Recent PRs
          </Group>
        </FitAiCardTitle>
        <FitAiCardDescription>Personal records in the last 30 days</FitAiCardDescription>
      </FitAiCardHeader>
      <FitAiCardContent>
        {isLoading ? (
          <Stack gap="xs">
            {Array.from({ length: 4 }).map((_, i) => (
              <PRItemSkeleton key={i} />
            ))}
          </Stack>
        ) : records.length === 0 ? (
          <Stack py="lg" align="center" ta="center" className={styles.emptyState}>
            <Box className={styles.emptyIcon}>
              <IconTrophy size={40} />
            </Box>
            <Text size="sm" c="dimmed">
              Complete workouts to start tracking PRs
            </Text>
          </Stack>
        ) : (
          <Stack gap={4}>
            {records.map((record, index) => (
              <PRItem
                key={record.id}
                record={record}
                onClick={() => onRecordClick?.(record.id)}
                index={index}
              />
            ))}
          </Stack>
        )}
      </FitAiCardContent>
    </FitAiCard>
  );
}

export function RecentPRsSkeleton() {
  return <RecentPRs records={[]} isLoading={true} />;
}
