/**
 * PRDetailModal - Modal showing detailed PR information with history
 */

import {
  IconCalendar,
  IconTrophy,
  IconExternalLink,
  IconNotes,
  IconHistory,
} from "@tabler/icons-react";
import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Flex,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import {
  formatRecordValue,
  formatDate,
  RECORD_TYPE_COLORS,
  RECORD_TYPE_LABELS,
  type RecordTypeFilter,
} from "./use-records-data";
import styles from "./pr-detail-modal.module.css";

interface PersonalRecord {
  id: number;
  userId: string;
  exerciseId: number;
  recordType: string;
  value: number;
  displayUnit: string | null;
  achievedAt: Date;
  workoutId: number | null;
  exerciseSetId: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  exercise?: {
    id: number;
    name: string;
    category: string;
    exerciseType: string;
  };
}

interface PRDetailModalProps {
  recordId: number | null;
  opened: boolean;
  onClose: () => void;
}

interface PRHistoryItemProps {
  record: {
    id: number;
    recordType: string;
    value: number;
    displayUnit: string | null;
    achievedAt: Date;
  };
  isLatest: boolean;
}

function PRHistoryItem({ record, isLatest }: PRHistoryItemProps) {
  const color = isLatest ? "green" : "gray";

  return (
    <Timeline.Item
      bullet={
        isLatest ? <IconTrophy size={12} /> : <Box w={8} h={8} className={styles.timelineBullet} />
      }
      color={color}
    >
      <Box className={styles.historyItem} data-is-latest={isLatest}>
        <Group gap="xs" wrap="nowrap">
          <Text size="sm" fw={isLatest ? 600 : 400}>
            {formatRecordValue(record.value, record.recordType, record.displayUnit)}
          </Text>
          {isLatest && (
            <Badge size="xs" color="green" variant="light">
              Current
            </Badge>
          )}
        </Group>
        <Text size="xs" c="dimmed">
          {formatDate(new Date(record.achievedAt))}
        </Text>
      </Box>
    </Timeline.Item>
  );
}

export function PRDetailModal({ recordId, opened, onClose }: PRDetailModalProps) {
  // Fetch selected record details
  const recordQuery = useQuery({
    ...orpc.personalRecord.getById.queryOptions({
      input: { id: recordId ?? 0 },
    }),
    enabled: recordId !== null && opened,
  });

  // Fetch all records for this exercise to show history
  const exerciseId = recordQuery.data?.exerciseId;
  const historyQuery = useQuery({
    ...orpc.personalRecord.getByExercise.queryOptions({
      input: { exerciseId: exerciseId ?? 0 },
    }),
    enabled: exerciseId !== undefined && opened,
  });

  const record = recordQuery.data as PersonalRecord | undefined;
  const isLoading = recordQuery.isLoading;
  const isError = recordQuery.isError;

  // Filter history to same record type and sort by date
  const history = (historyQuery.data ?? [])
    .filter((r) => r.recordType === record?.recordType)
    .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
    .slice(0, 10);

  const recordTypeKey = record?.recordType as RecordTypeFilter | undefined;
  const color = record ? (RECORD_TYPE_COLORS[record.recordType] ?? "gray") : "gray";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconTrophy size={20} className={styles.trophyIcon} />
          <Text fw={600}>Personal Record Details</Text>
        </Group>
      }
      size="md"
      centered
      classNames={{
        content: styles.modalContent,
        header: styles.modalHeader,
      }}
    >
      {isLoading ? (
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      ) : isError || !record ? (
        <Center py="xl">
          <Stack align="center" gap="sm">
            <Text c="dimmed">Could not load record details</Text>
            <Button variant="light" onClick={onClose}>
              Close
            </Button>
          </Stack>
        </Center>
      ) : (
        <Stack gap="lg">
          {/* Main Record Info */}
          <Card
            padding="md"
            radius="md"
            className={styles.recordCard}
            data-record-type={record.recordType}
          >
            <Group gap="md" wrap="nowrap" align="flex-start">
              <ThemeIcon size={56} radius="md" variant="light" color={color}>
                <IconTrophy size={28} />
              </ThemeIcon>
              <Box flex={1} miw={0}>
                <Text size="lg" fw={700} mb={4}>
                  {record.exercise?.name ?? "Unknown Exercise"}
                </Text>
                <Group gap="xs" wrap="wrap">
                  <Badge size="sm" variant="light" color={color}>
                    {recordTypeKey ? RECORD_TYPE_LABELS[recordTypeKey] : record.recordType}
                  </Badge>
                  <Badge size="sm" variant="light" color="gray">
                    {record.exercise?.category ?? "Unknown"}
                  </Badge>
                </Group>
              </Box>
            </Group>

            <Divider my="md" />

            <Flex gap="xl" wrap="wrap">
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb={4}>
                  Value
                </Text>
                <Text size="xl" fw={700}>
                  {formatRecordValue(record.value, record.recordType, record.displayUnit)}
                </Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb={4}>
                  Achieved
                </Text>
                <Group gap={6}>
                  <IconCalendar size={16} />
                  <Text size="md" fw={500}>
                    {formatDate(new Date(record.achievedAt))}
                  </Text>
                </Group>
              </Box>
            </Flex>
          </Card>

          {/* Notes Section */}
          {record.notes && (
            <Box>
              <Group gap="xs" mb="xs">
                <IconNotes size={16} />
                <Text size="sm" fw={500}>
                  Notes
                </Text>
              </Group>
              <Card padding="sm" radius="sm" className={styles.notesCard}>
                <Text size="sm">{record.notes}</Text>
              </Card>
            </Box>
          )}

          {/* History Section */}
          {history.length > 1 && (
            <Box>
              <Group gap="xs" mb="md">
                <IconHistory size={16} />
                <Text size="sm" fw={500}>
                  Record History
                </Text>
                <Badge size="xs" variant="light" color="gray">
                  {history.length} records
                </Badge>
              </Group>
              <Timeline
                active={history.length}
                bulletSize={20}
                lineWidth={2}
                classNames={{ item: styles.timelineItem }}
              >
                {history.map((historyRecord, index) => (
                  <PRHistoryItem
                    key={historyRecord.id}
                    record={historyRecord}
                    isLatest={index === 0}
                  />
                ))}
              </Timeline>
            </Box>
          )}

          {/* Actions */}
          <Group justify="flex-end" gap="sm">
            {record.workoutId && (
              <Button variant="light" leftSection={<IconExternalLink size={16} />} size="sm">
                View Workout
              </Button>
            )}
            <Button variant="default" onClick={onClose} size="sm">
              Close
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
