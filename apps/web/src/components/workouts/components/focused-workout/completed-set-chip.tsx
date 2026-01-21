import { Badge, Group, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

import styles from "./completed-set-chip.module.css";

interface CompletedSetChipProps {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  onClick?: () => void;
}

export function CompletedSetChip({ setNumber: _setNumber, weight, reps, onClick }: CompletedSetChipProps) {
  void _setNumber; // Keep for backward compatibility but not displayed
  // BUG FIX: Don't render chip if weight or reps are null
  // This prevents showing "- × -" for incomplete sets
  if (weight === null || reps === null) {
    return null;
  }

  return (
    <Badge
      className={styles.chip}
      data-no-click={!onClick ? true : undefined}
      variant="filled"
      size="lg"
      onClick={onClick}
    >
      <Group gap={6} wrap="nowrap">
        <IconCheck size={14} stroke={2.5} />
        <Text size="sm" fw={500} span>
          {weight}kg × {reps}
        </Text>
      </Group>
    </Badge>
  );
}
