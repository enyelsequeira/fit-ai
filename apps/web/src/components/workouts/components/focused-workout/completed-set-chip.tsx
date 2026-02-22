/**
 * CompletedSetChip - Compact table row for completed set display
 * Redesigned from horizontal badge chip to a clean vertical list row.
 */

import { Divider, Group, Text } from "@mantine/core";

import styles from "./completed-set-chip.module.css";

interface CompletedSetChipProps {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  onClick?: () => void;
}

export function CompletedSetChip({ setNumber, weight, reps, onClick }: CompletedSetChipProps) {
  return (
    <Group
      gap="sm"
      wrap="nowrap"
      className={styles.row}
      onClick={onClick}
      data-clickable={onClick ? true : undefined}
    >
      <Text size="xs" fw={700} c="dimmed" className={styles.setNum}>
        #{setNumber}
      </Text>

      <Divider orientation="vertical" className={styles.divider} />

      <Text size="sm" fw={600} className={styles.value}>
        {weight ?? "—"}
        <Text span size="xs" c="dimmed" fw={400}>
          {" "}
          kg
        </Text>
      </Text>

      <Text size="sm" fw={600} className={styles.value}>
        {reps ?? "—"}
        <Text span size="xs" c="dimmed" fw={400}>
          {" "}
          reps
        </Text>
      </Text>
    </Group>
  );
}
