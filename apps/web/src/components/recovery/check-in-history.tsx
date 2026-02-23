/**
 * CheckInHistory - Displays past check-ins in a timeline format
 * Shows summary of each check-in with key metrics
 */

import type { Mood } from "./types";

import {
  Badge,
  Box,
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
  Timeline,
  UnstyledButton,
} from "@mantine/core";
import {
  IconCalendar,
  IconChevronDown,
  IconMoon,
  IconFlame,
  IconActivity,
} from "@tabler/icons-react";
import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import { EmptyState } from "@/components/ui/state-views";
import { formatRelativeDate } from "@/components/ui/utils";

interface CheckInHistoryItem {
  id: number;
  userId: string;
  date: string;
  sleepHours: number | null;
  sleepQuality: number | null;
  energyLevel: number | null;
  stressLevel: number | null;
  sorenessLevel: number | null;
  soreAreas: string[] | null;
  restingHeartRate: number | null;
  hrvScore: number | null;
  motivationLevel: number | null;
  mood: Mood | null;
  nutritionQuality: number | null;
  hydrationLevel: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CheckInHistoryProps {
  checkIns: CheckInHistoryItem[];
  hasMore: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  onSelectCheckIn?: (checkIn: CheckInHistoryItem) => void;
}

const MOOD_CONFIG: Record<Mood, { label: string; color: string }> = {
  great: { label: "Great", color: "teal" },
  good: { label: "Good", color: "green" },
  neutral: { label: "Neutral", color: "yellow" },
  low: { label: "Low", color: "orange" },
  bad: { label: "Bad", color: "red" },
};

function getScoreColor(value: number | null, max: number, inverse = false): string {
  if (value === null) return "gray";
  const percentage = (value / max) * 100;
  if (inverse) {
    if (percentage <= 30) return "teal";
    if (percentage <= 60) return "yellow";
    return "red";
  }
  if (percentage >= 70) return "teal";
  if (percentage >= 40) return "yellow";
  return "red";
}

function CheckInHistoryItemCard({
  checkIn,
  onClick,
}: {
  checkIn: CheckInHistoryItem;
  onClick?: () => void;
}) {
  const moodInfo = checkIn.mood ? MOOD_CONFIG[checkIn.mood] : null;

  const content = (
    <Stack gap="xs">
      {/* Header with date and mood */}
      <Group justify="space-between">
        <Group gap="xs">
          <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
          <Text fz="xs" fw={500}>
            {formatRelativeDate(checkIn.date)}
          </Text>
        </Group>
        {moodInfo && (
          <Badge size="xs" color={moodInfo.color} variant="light">
            {moodInfo.label}
          </Badge>
        )}
      </Group>

      {/* Key metrics */}
      <Group gap="md">
        {checkIn.sleepHours !== null && (
          <Group gap={4}>
            <IconMoon size={12} color="var(--mantine-color-blue-5)" />
            <Text fz="xs" ff="var(--mantine-font-family-monospace)">
              {checkIn.sleepHours}h
            </Text>
          </Group>
        )}
        {checkIn.energyLevel !== null && (
          <Group gap={4}>
            <IconFlame
              size={12}
              color={`var(--mantine-color-${getScoreColor(checkIn.energyLevel, 10)}-5)`}
            />
            <Text fz="xs" ff="var(--mantine-font-family-monospace)">
              {checkIn.energyLevel}/10
            </Text>
          </Group>
        )}
        {checkIn.sorenessLevel !== null && (
          <Group gap={4}>
            <IconActivity
              size={12}
              color={`var(--mantine-color-${getScoreColor(checkIn.sorenessLevel, 10, true)}-5)`}
            />
            <Text fz="xs" ff="var(--mantine-font-family-monospace)">
              {checkIn.sorenessLevel}/10
            </Text>
          </Group>
        )}
      </Group>

      {/* Notes preview */}
      {checkIn.notes && (
        <Text fz="xs" c="dimmed" lineClamp={1}>
          {checkIn.notes}
        </Text>
      )}
    </Stack>
  );

  if (onClick) {
    return (
      <UnstyledButton
        p="xs"
        w="100%"
        bd="1px solid var(--mantine-color-default-border)"
        style={{
          borderRadius: "var(--mantine-radius-sm)",
          transition: "background-color 150ms ease",
        }}
        onClick={onClick}
        __vars={{
          "--hover-bg": "var(--mantine-color-gray-light-hover)",
        }}
        mod={{ clickable: true }}
      >
        {content}
      </UnstyledButton>
    );
  }

  return (
    <Box
      p="xs"
      bd="1px solid var(--mantine-color-default-border)"
      style={{ borderRadius: "var(--mantine-radius-sm)" }}
    >
      {content}
    </Box>
  );
}

function CheckInHistory({
  checkIns,
  hasMore,
  isLoading = false,
  onLoadMore,
  onSelectCheckIn,
}: CheckInHistoryProps) {
  if (isLoading && checkIns.length === 0) {
    return (
      <Card withBorder>
        <Card.Section withBorder inheritPadding py="sm">
          <Text fz="sm" fw={500}>
            Check-in History
          </Text>
        </Card.Section>
        <Card.Section inheritPadding py="md">
          <Stack gap="sm">
            <Skeleton height={80} />
            <Skeleton height={80} />
            <Skeleton height={80} />
          </Stack>
        </Card.Section>
      </Card>
    );
  }

  if (checkIns.length === 0) {
    return (
      <Card withBorder>
        <Card.Section withBorder inheritPadding py="sm">
          <Text fz="sm" fw={500}>
            Check-in History
          </Text>
        </Card.Section>
        <Card.Section inheritPadding py="lg">
          <EmptyState
            icon={<IconCalendar size={48} stroke={1.5} />}
            title="No check-ins yet"
            message="No check-ins recorded yet. Start tracking your recovery today!"
          />
        </Card.Section>
      </Card>
    );
  }

  return (
    <Card withBorder>
      <Card.Section withBorder inheritPadding py="sm">
        <Group justify="space-between">
          <Text fz="sm" fw={500}>
            Check-in History
          </Text>
          <Badge size="xs" variant="light" color="gray">
            {checkIns.length} entries
          </Badge>
        </Group>
      </Card.Section>
      <Card.Section inheritPadding py="md">
        <Stack gap="sm">
          <Timeline
            active={-1}
            bulletSize={8}
            lineWidth={1}
            styles={{
              item: { paddingLeft: 16 },
              itemBullet: { backgroundColor: "var(--mantine-color-gray-4)" },
            }}
          >
            {checkIns.map((checkIn) => (
              <Timeline.Item key={checkIn.id}>
                <CheckInHistoryItemCard
                  checkIn={checkIn}
                  onClick={onSelectCheckIn ? () => onSelectCheckIn(checkIn) : undefined}
                />
              </Timeline.Item>
            ))}
          </Timeline>

          {hasMore && (
            <FitAiButton
              variant="secondary"
              size="xs"
              fullWidth
              onClick={onLoadMore}
              loading={isLoading}
              leftSection={<IconChevronDown size={14} />}
            >
              Load More
            </FitAiButton>
          )}
        </Stack>
      </Card.Section>
    </Card>
  );
}

export { CheckInHistory };
export type { CheckInHistoryItem };
