/**
 * PRCard - Shared card component for displaying personal record information
 * Used across RecentPRsList and AllTimePRsGrid for consistent styling
 */

import type { ReactNode } from "react";
import { Badge, Box, Flex, Group, Text } from "@mantine/core";
import {
  formatRecordValue,
  RECORD_TYPE_COLORS,
  RECORD_TYPE_LABELS,
  type RecordTypeFilter,
} from "./use-records-data";
import styles from "./pr-card.module.css";

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

interface PRCardProps {
  record: PersonalRecord;
  onClick?: () => void;
  icon?: ReactNode;
  showExerciseName?: boolean;
  showRecordType?: boolean;
  showValue?: boolean;
  isRecent?: boolean;
  isNew?: boolean;
  variant?: "compact" | "full";
  rightSection?: ReactNode;
}

export function PRCard({
  record,
  onClick,
  icon,
  showExerciseName = true,
  showRecordType = true,
  showValue = true,
  isRecent = false,
  isNew = false,
  variant = "compact",
  rightSection,
}: PRCardProps) {
  const recordTypeKey = record.recordType as RecordTypeFilter;
  const color = RECORD_TYPE_COLORS[record.recordType] ?? "gray";

  return (
    <Flex
      align="center"
      gap="sm"
      p="sm"
      className={styles.prCard}
      onClick={onClick}
      data-record-type={record.recordType}
      data-is-recent={isRecent}
      data-is-new={isNew}
      data-variant={variant}
      data-clickable={!!onClick}
    >
      {icon && (
        <Box className={styles.iconContainer} data-is-new={isNew}>
          {icon}
        </Box>
      )}

      <Box flex={1} miw={0}>
        {showExerciseName && (
          <Group gap={6} wrap="nowrap">
            <Text size="sm" fw={600} truncate>
              {record.exercise?.name ?? "Unknown Exercise"}
            </Text>
            {isNew && (
              <Badge size="xs" variant="light" color="green">
                NEW
              </Badge>
            )}
          </Group>
        )}

        {showRecordType && (
          <Badge size="xs" variant="light" color={color} mt={showExerciseName ? 4 : 0}>
            {RECORD_TYPE_LABELS[recordTypeKey] ?? record.recordType}
          </Badge>
        )}
      </Box>

      {(showValue || rightSection) && (
        <Box ta="right">
          {showValue && (
            <Text size="md" fw={700} className={styles.prValue}>
              {formatRecordValue(record.value, record.recordType, record.displayUnit)}
            </Text>
          )}
          {rightSection}
        </Box>
      )}
    </Flex>
  );
}

interface PRCardValueProps {
  record: PersonalRecord;
  onClick?: () => void;
  label?: string;
  sublabel?: ReactNode;
}

/**
 * PRCardValue - Minimal card variant showing just the record value
 * Used in AllTimePRsGrid for displaying multiple records per exercise
 */
export function PRCardValue({ record, onClick, label, sublabel }: PRCardValueProps) {
  const recordTypeKey = record.recordType as RecordTypeFilter;
  const color = RECORD_TYPE_COLORS[record.recordType] ?? "gray";

  return (
    <Flex
      align="center"
      justify="space-between"
      gap="xs"
      w="100%"
      p="xs"
      className={styles.prCardValue}
      onClick={onClick}
      data-color={color}
      data-clickable={!!onClick}
    >
      <Box>
        <Text size="xs" c="dimmed" mb={2}>
          {label ?? RECORD_TYPE_LABELS[recordTypeKey] ?? record.recordType}
        </Text>
        <Text size="sm" fw={700}>
          {formatRecordValue(record.value, record.recordType, record.displayUnit)}
        </Text>
      </Box>
      {sublabel && (
        <Text size="xs" c="dimmed">
          {sublabel}
        </Text>
      )}
    </Flex>
  );
}
