import { Badge, Group } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import styles from "./completed-set-chip.module.css";

interface CompletedSetChipProps {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  onClick?: () => void;
}

export function CompletedSetChip({
  setNumber: _setNumber,
  weight,
  reps,
  onClick,
}: CompletedSetChipProps) {
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
        <FitAiText.Label span className={styles.text}>
          {weight}kg × {reps}
        </FitAiText.Label>
      </Group>
    </Badge>
  );
}
