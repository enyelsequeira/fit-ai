/**
 * CheckInSummary - Displays today's check-in summary
 * Shows key metrics at a glance with visual indicators
 */

import { Box, Button, Card, Group, SimpleGrid, Skeleton, Stack, Text } from "@mantine/core";
import { IconActivity, IconEdit, IconFlame, IconMoon } from "@tabler/icons-react";

import type { CheckInData, CheckInSummaryProps } from "./types";
import { formatDate } from "./utils";
import { AdvancedMetrics } from "./advanced-metrics";
import { MetricCard } from "./metric-card";
import { MoodDisplay } from "./mood-display";
import { SorenessDisplay } from "./soreness-display";
import { StatItem } from "./stat-item";
import styles from "../recovery-view.module.css";

function LoadingSkeleton() {
  return (
    <Card withBorder>
      <Card.Section withBorder inheritPadding py="sm">
        <Text fz="sm" fw={500}>
          Today's Check-in
        </Text>
      </Card.Section>
      <Card.Section inheritPadding py="md">
        <SimpleGrid cols={3} spacing="xs">
          <Skeleton height={80} />
          <Skeleton height={80} />
          <Skeleton height={80} />
        </SimpleGrid>
      </Card.Section>
    </Card>
  );
}

function EmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <Card withBorder>
      <Card.Section withBorder inheritPadding py="sm">
        <Text fz="sm" fw={500}>
          Today's Check-in
        </Text>
      </Card.Section>
      <Card.Section inheritPadding py="lg">
        <Stack align="center" gap="md">
          <Text c="dimmed" fz="sm" ta="center">
            You haven't logged your check-in today. How are you feeling?
          </Text>
          <Button onClick={onCreateNew} variant="light">
            Start Check-in
          </Button>
        </Stack>
      </Card.Section>
    </Card>
  );
}

function CheckInContent({ checkIn, onEdit }: { checkIn: CheckInData; onEdit?: () => void }) {
  return (
    <Card withBorder>
      <Card.Section withBorder inheritPadding py="sm">
        <Group justify="space-between">
          <Text fz="sm" fw={500}>
            {formatDate(checkIn.date)}
          </Text>
          {onEdit && (
            <Button
              size="xs"
              variant="subtle"
              leftSection={<IconEdit size={14} />}
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
        </Group>
      </Card.Section>
      <Card.Section inheritPadding py="md">
        <Stack gap="md">
          {/* Key Metrics */}
          <SimpleGrid cols={3} spacing="xs">
            <MetricCard
              icon={<IconMoon size={18} />}
              label="Sleep"
              value={checkIn.sleepHours}
              max={10}
              unit="h"
            />
            <MetricCard
              icon={<IconFlame size={18} />}
              label="Energy"
              value={checkIn.energyLevel}
              max={10}
            />
            <MetricCard
              icon={<IconActivity size={18} />}
              label="Soreness"
              value={checkIn.sorenessLevel}
              max={10}
              inverse
            />
          </SimpleGrid>

          {/* Detailed Stats */}
          <Stack gap="xs">
            <StatItem label="Sleep Quality" value={checkIn.sleepQuality} max={5} />
            <StatItem label="Motivation" value={checkIn.motivationLevel} max={10} />
            <StatItem label="Stress" value={checkIn.stressLevel} max={10} inverse />
            <StatItem label="Nutrition" value={checkIn.nutritionQuality} max={5} />
            <StatItem label="Hydration" value={checkIn.hydrationLevel} max={5} />
          </Stack>

          {/* Mood and Sore Areas */}
          <Group justify="space-between" gap="xs">
            <MoodDisplay mood={checkIn.mood} />
            <SorenessDisplay soreAreas={checkIn.soreAreas} />
          </Group>

          {/* Advanced Metrics */}
          <AdvancedMetrics
            restingHeartRate={checkIn.restingHeartRate}
            hrvScore={checkIn.hrvScore}
          />

          {/* Notes preview */}
          {checkIn.notes && (
            <Box className={styles.notesBox}>
              <Text fz="xs" c="dimmed" lineClamp={2}>
                {checkIn.notes}
              </Text>
            </Box>
          )}
        </Stack>
      </Card.Section>
    </Card>
  );
}

function CheckInSummary({ checkIn, isLoading = false, onEdit, onCreateNew }: CheckInSummaryProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!checkIn) {
    return <EmptyState onCreateNew={onCreateNew} />;
  }

  return <CheckInContent checkIn={checkIn} onEdit={onEdit} />;
}

export { CheckInSummary };
export type { CheckInData as CheckInSummaryData, CheckInSummaryProps };
