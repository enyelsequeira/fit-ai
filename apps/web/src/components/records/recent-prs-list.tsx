/**
 * RecentPRsList - List of recently achieved personal records with celebration styling
 */

import { IconFlame, IconMedal, IconSparkles, IconTrophy } from "@tabler/icons-react";
import {
  Badge,
  Box,
  Card,
  Center,
  Flex,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
  Transition,
} from "@mantine/core";
import {
  formatRecordValue,
  formatRelativeDate,
  isToday,
  isWithinDays,
  RECORD_TYPE_COLORS,
  RECORD_TYPE_LABELS,
  type RecordTypeFilter,
} from "./use-records-data";
import styles from "./recent-prs-list.module.css";

interface PersonalRecord {
  id: number;
  exerciseId: number;
  recordType: string;
  value: number;
  displayUnit: string | null;
  achievedAt: Date;
  exercise?: {
    id: number;
    name: string;
    category: string;
    exerciseType: string;
  };
}

interface RecentPRsListProps {
  records: PersonalRecord[];
  isLoading?: boolean;
  onRecordClick?: (recordId: number) => void;
}

function PRItemSkeleton() {
  return (
    <Flex align="center" gap="sm" p="sm">
      <Skeleton height={48} width={48} radius="md" />
      <Box flex={1}>
        <Skeleton height={16} width="70%" mb={6} />
        <Skeleton height={14} width="40%" />
      </Box>
      <Box ta="right">
        <Skeleton height={20} width={64} mb={4} />
        <Skeleton height={12} width={48} />
      </Box>
    </Flex>
  );
}

interface PRItemProps {
  record: PersonalRecord;
  onClick?: () => void;
  index: number;
  isRecent: boolean;
}

function PRItem({ record, onClick, index, isRecent }: PRItemProps) {
  const achievedDate = new Date(record.achievedAt);
  const isTodayRecord = isToday(achievedDate);
  const isYesterdayRecord = (() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toDateString() === achievedDate.toDateString();
  })();

  const recordTypeKey = record.recordType as RecordTypeFilter;
  const color = RECORD_TYPE_COLORS[record.recordType] ?? "gray";

  return (
    <Transition mounted={true} transition="slide-right" duration={300} timingFunction="ease">
      {(transitionStyles) => (
        <Flex
          align="center"
          gap="sm"
          p="sm"
          className={styles.prItem}
          onClick={onClick}
          style={{
            ...transitionStyles,
            animationDelay: `${index * 50}ms`,
          }}
          data-recent={isTodayRecord || isYesterdayRecord}
          data-record-type={record.recordType}
          data-is-new={isTodayRecord}
        >
          <Center h={48} w={48} className={styles.medalIcon} data-today={isTodayRecord}>
            {isTodayRecord ? (
              <IconSparkles size={24} className={styles.sparkleIcon} />
            ) : isRecent ? (
              <IconFlame size={22} />
            ) : (
              <IconMedal size={22} />
            )}
          </Center>

          <Box flex={1} miw={0}>
            <Group gap={6} wrap="nowrap">
              <Text size="sm" fw={600} truncate>
                {record.exercise?.name ?? "Unknown Exercise"}
              </Text>
              {isTodayRecord && (
                <Badge size="xs" variant="light" color="green">
                  NEW
                </Badge>
              )}
            </Group>
            <Badge size="xs" variant="light" color={color} mt={4}>
              {RECORD_TYPE_LABELS[recordTypeKey] ?? record.recordType}
            </Badge>
          </Box>

          <Box ta="right">
            <Text size="md" fw={700} className={styles.prValue}>
              {formatRecordValue(record.value, record.recordType, record.displayUnit)}
            </Text>
            <Text size="xs" c="dimmed">
              {formatRelativeDate(achievedDate)}
            </Text>
          </Box>
        </Flex>
      )}
    </Transition>
  );
}

export function RecentPRsList({ records, isLoading, onRecordClick }: RecentPRsListProps) {
  if (isLoading) {
    return (
      <Card padding="md" radius="md" className={styles.card}>
        <Group gap="xs" mb="md">
          <IconTrophy size={20} className={styles.trophyIcon} />
          <Title order={4}>Recent PRs</Title>
        </Group>
        <Stack gap={4}>
          {Array.from({ length: 5 }).map((_, i) => (
            <PRItemSkeleton key={i} />
          ))}
        </Stack>
      </Card>
    );
  }

  return (
    <Card padding="md" radius="md" className={styles.card}>
      <Group gap="xs" mb="md">
        <IconTrophy size={20} className={styles.trophyIcon} />
        <Title order={4}>Recent PRs</Title>
        <Text size="sm" c="dimmed" ml="auto">
          Last 30 days
        </Text>
      </Group>

      {records.length === 0 ? (
        <Center py="xl" className={styles.emptyState}>
          <Stack align="center" gap="sm">
            <Box className={styles.emptyIcon}>
              <IconTrophy size={40} />
            </Box>
            <Text size="sm" c="dimmed" ta="center">
              No recent PRs yet.
              <br />
              Complete workouts to start setting records!
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap={4} className={styles.prList}>
          {records.map((record, index) => (
            <PRItem
              key={record.id}
              record={record}
              onClick={() => onRecordClick?.(record.id)}
              index={index}
              isRecent={isWithinDays(new Date(record.achievedAt), 7)}
            />
          ))}
        </Stack>
      )}
    </Card>
  );
}
