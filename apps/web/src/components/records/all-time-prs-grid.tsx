/**
 * AllTimePRsGrid - Grid displaying all-time best personal records for key lifts
 */

import { IconBarbell, IconChevronRight, IconTrophy } from "@tabler/icons-react";
import {
  Badge,
  Box,
  Card,
  Center,
  Flex,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  formatRecordValue,
  formatDate,
  RECORD_TYPE_COLORS,
  RECORD_TYPE_LABELS,
  type RecordTypeFilter,
} from "./use-records-data";
import styles from "./all-time-prs-grid.module.css";

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

interface ExerciseGroup {
  exerciseId: number;
  exerciseName: string;
  exerciseCategory: string;
  records: PersonalRecord[];
  hasRecentPR?: boolean;
}

interface AllTimePRsGridProps {
  recordsByExercise: ExerciseGroup[];
  isLoading?: boolean;
  onExerciseClick?: (exerciseId: number) => void;
  onRecordClick?: (recordId: number) => void;
}

function ExerciseCardSkeleton() {
  return (
    <Card padding="md" radius="md" className={styles.exerciseCard}>
      <Group gap="sm" mb="sm">
        <Skeleton height={36} width={36} radius="md" />
        <Box flex={1}>
          <Skeleton height={16} width="60%" mb={4} />
          <Skeleton height={12} width="30%" />
        </Box>
      </Group>
      <Stack gap="xs">
        <Skeleton height={44} radius="sm" />
        <Skeleton height={44} radius="sm" />
      </Stack>
    </Card>
  );
}

interface RecordBadgeProps {
  record: PersonalRecord;
  onClick?: () => void;
}

function RecordBadge({ record, onClick }: RecordBadgeProps) {
  const recordTypeKey = record.recordType as RecordTypeFilter;
  const color = RECORD_TYPE_COLORS[record.recordType] ?? "gray";

  return (
    <UnstyledButton onClick={onClick} className={styles.recordBadge} data-color={color}>
      <Flex align="center" justify="space-between" gap="xs" w="100%">
        <Box>
          <Text size="xs" c="dimmed" mb={2}>
            {RECORD_TYPE_LABELS[recordTypeKey] ?? record.recordType}
          </Text>
          <Text size="sm" fw={700}>
            {formatRecordValue(record.value, record.recordType, record.displayUnit)}
          </Text>
        </Box>
        <Text size="xs" c="dimmed">
          {formatDate(new Date(record.achievedAt))}
        </Text>
      </Flex>
    </UnstyledButton>
  );
}

interface ExerciseCardProps {
  group: ExerciseGroup;
  onExerciseClick?: () => void;
  onRecordClick?: (recordId: number) => void;
  index: number;
}

function ExerciseCard({ group, onExerciseClick, onRecordClick, index }: ExerciseCardProps) {
  // Sort records by type priority (1RM first, then max weight, max reps, etc.)
  const sortedRecords = [...group.records].sort((a, b) => {
    const priority: Record<string, number> = {
      one_rep_max: 1,
      max_weight: 2,
      max_reps: 3,
      max_volume: 4,
      best_time: 5,
      longest_duration: 6,
      longest_distance: 7,
    };
    return (priority[a.recordType] ?? 99) - (priority[b.recordType] ?? 99);
  });

  // Take top 3 records for display
  const displayRecords = sortedRecords.slice(0, 3);
  const hasMore = sortedRecords.length > 3;

  // Normalize category for data attribute
  const categoryNormalized = group.exerciseCategory.toLowerCase().replace(/\s+/g, "-");

  return (
    <Card
      padding="md"
      radius="md"
      className={styles.exerciseCard}
      style={{ animationDelay: `${index * 50}ms` }}
      data-category={categoryNormalized}
      data-has-recent={group.hasRecentPR}
    >
      <UnstyledButton onClick={onExerciseClick} className={styles.exerciseHeader}>
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={36} radius="md" variant="light" color="blue">
            <IconBarbell size={18} />
          </ThemeIcon>
          <Box flex={1} miw={0}>
            <Text size="sm" fw={600} truncate>
              {group.exerciseName}
            </Text>
            <Badge size="xs" variant="light" color="gray">
              {group.exerciseCategory}
            </Badge>
          </Box>
          <ThemeIcon size={24} radius="xl" variant="subtle" color="gray">
            <IconChevronRight size={14} />
          </ThemeIcon>
        </Group>
      </UnstyledButton>

      <Stack gap="xs" mt="sm">
        {displayRecords.map((record) => (
          <RecordBadge key={record.id} record={record} onClick={() => onRecordClick?.(record.id)} />
        ))}

        {hasMore && (
          <Text size="xs" c="dimmed" ta="center" mt={4}>
            +{sortedRecords.length - 3} more records
          </Text>
        )}
      </Stack>
    </Card>
  );
}

export function AllTimePRsGrid({
  recordsByExercise,
  isLoading,
  onExerciseClick,
  onRecordClick,
}: AllTimePRsGridProps) {
  if (isLoading) {
    return (
      <Box className={styles.container}>
        <Group gap="xs" mb="md">
          <IconTrophy size={20} className={styles.trophyIcon} />
          <Title order={4}>All-Time Bests</Title>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {Array.from({ length: 6 }).map((_, i) => (
            <ExerciseCardSkeleton key={i} />
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  if (recordsByExercise.length === 0) {
    return (
      <Box className={styles.container}>
        <Group gap="xs" mb="md">
          <IconTrophy size={20} className={styles.trophyIcon} />
          <Title order={4}>All-Time Bests</Title>
        </Group>
        <Card padding="xl" radius="md" className={styles.emptyCard}>
          <Center>
            <Stack align="center" gap="sm">
              <ThemeIcon size={60} radius="xl" variant="light" color="yellow">
                <IconTrophy size={32} />
              </ThemeIcon>
              <Text size="sm" c="dimmed" ta="center">
                No personal records yet.
                <br />
                Complete workouts to start tracking your bests!
              </Text>
            </Stack>
          </Center>
        </Card>
      </Box>
    );
  }

  return (
    <Box className={styles.container}>
      <Group gap="xs" mb="md">
        <IconTrophy size={20} className={styles.trophyIcon} />
        <Title order={4}>All-Time Bests</Title>
        <Badge size="sm" variant="light" color="gray" ml="auto">
          {recordsByExercise.length} exercises
        </Badge>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {recordsByExercise.map((group, index) => (
          <ExerciseCard
            key={group.exerciseId}
            group={group}
            onExerciseClick={() => onExerciseClick?.(group.exerciseId)}
            onRecordClick={onRecordClick}
            index={index}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}
