/**
 * MeasurementsHistory - Table showing past body measurements
 * Displays history with edit and delete actions
 */

import { ActionIcon, Badge, Box, Group, Menu, ScrollArea, Stack, Table, Text } from "@mantine/core";
import { IconDotsVertical, IconEdit, IconTrash, IconInbox } from "@tabler/icons-react";
import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state-views";
import { Skeleton } from "@/components/ui/skeleton";
import type { MeasurementsHistoryProps, MeasurementHistoryRow } from "./types";
import styles from "./measurements-history.module.css";

interface RowMenuProps {
  measurementId: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

function RowMenu({ measurementId, onEdit, onDelete }: RowMenuProps) {
  return (
    <Menu position="bottom-end" withArrow shadow="md">
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" size="sm" className={styles.actionMenu}>
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit(measurementId)}>
          Edit
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<IconTrash size={14} />}
          onClick={() => onDelete(measurementId)}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatValue(value: number | null, unit: string = ""): string {
  if (value === null) return "--";
  return `${value.toFixed(1)}${unit ? ` ${unit}` : ""}`;
}

function LoadingSkeleton() {
  return (
    <Stack gap="sm" py="md" data-state="loading">
      {Array.from({ length: 5 }).map((_, i) => (
        <Group key={i} gap="xl" py="xs">
          <Skeleton h={16} w={80} />
          <Skeleton h={16} w={60} />
          <Skeleton h={16} w={50} />
          <Skeleton h={16} w={50} />
          <Skeleton h={16} w={50} />
          <Skeleton h={16} w={24} />
        </Group>
      ))}
    </Stack>
  );
}

function HistoryEmptyState() {
  return (
    <EmptyState
      icon={<IconInbox size={48} stroke={1.5} />}
      title="No measurements recorded"
      message="Start logging your body measurements to track your progress."
    />
  );
}

interface MeasurementRowProps {
  measurement: MeasurementHistoryRow;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  index: number;
}

function MeasurementRow({ measurement, onEdit, onDelete, index }: MeasurementRowProps) {
  const hasDetailedMeasurements =
    measurement.chest !== null ||
    measurement.waist !== null ||
    measurement.hips !== null ||
    measurement.leftArm !== null ||
    measurement.rightArm !== null;

  const hasNotes = Boolean(measurement.notes);

  return (
    <Table.Tr
      className={styles.tableRow}
      style={{ animationDelay: `${index * 30}ms` }}
      data-has-details={hasDetailedMeasurements ? "true" : undefined}
      data-has-notes={hasNotes ? "true" : undefined}
    >
      <Table.Td>
        <Text size="sm" fw={500}>
          {formatDate(measurement.date)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatValue(measurement.weight, measurement.weightUnit ?? "kg")}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {measurement.bodyFatPercentage !== null
            ? `${measurement.bodyFatPercentage.toFixed(1)}%`
            : "--"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatValue(measurement.chest)}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatValue(measurement.waist)}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatValue(measurement.hips)}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {hasDetailedMeasurements && (
            <Badge size="xs" variant="light" color="blue">
              Detailed
            </Badge>
          )}
          {hasNotes && (
            <Badge size="xs" variant="light" color="gray">
              Notes
            </Badge>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        <RowMenu measurementId={measurement.id} onEdit={onEdit} onDelete={onDelete} />
      </Table.Td>
    </Table.Tr>
  );
}

export function MeasurementsHistory({
  measurements,
  isLoading,
  onEdit,
  onDelete,
}: MeasurementsHistoryProps) {
  const isEmpty = measurements.length === 0;

  return (
    <FitAiCard
      className={styles.historyCard}
      data-loading={isLoading ? "true" : undefined}
      data-empty={isEmpty && !isLoading ? "true" : undefined}
    >
      <FitAiCardHeader>
        <Group justify="space-between">
          <Box>
            <FitAiCardTitle>Measurement History</FitAiCardTitle>
            <FitAiCardDescription>
              {measurements.length > 0
                ? `${measurements.length} measurements recorded`
                : "Your measurement records"}
            </FitAiCardDescription>
          </Box>
        </Group>
      </FitAiCardHeader>
      <FitAiCardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : isEmpty ? (
          <HistoryEmptyState />
        ) : (
          <ScrollArea className={styles.tableScrollArea}>
            <Table striped highlightOnHover withTableBorder={false} className={styles.table}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Weight</Table.Th>
                  <Table.Th>Body Fat</Table.Th>
                  <Table.Th>Chest</Table.Th>
                  <Table.Th>Waist</Table.Th>
                  <Table.Th>Hips</Table.Th>
                  <Table.Th>Tags</Table.Th>
                  <Table.Th w={40}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {measurements.map((measurement, index) => (
                  <MeasurementRow
                    key={measurement.id}
                    measurement={measurement}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    index={index}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </FitAiCardContent>
    </FitAiCard>
  );
}
