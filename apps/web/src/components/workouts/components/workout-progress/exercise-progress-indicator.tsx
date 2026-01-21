/**
 * ExerciseProgressIndicator - Compact progress indicator for individual exercises
 * Shows completion status as a pill badge with tooltip
 */

import { Badge, Tooltip } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import styles from "./exercise-progress-indicator.module.css";

interface ExerciseProgressIndicatorProps {
  completedSets: number;
  totalSets: number;
}

type ProgressStatus = "not_started" | "in_progress" | "complete";

function getProgressStatus(completed: number, total: number): ProgressStatus {
  if (total === 0) return "not_started";
  if (completed === 0) return "not_started";
  if (completed >= total) return "complete";
  return "in_progress";
}

function getStatusColor(status: ProgressStatus): string {
  switch (status) {
    case "complete":
      return "green";
    case "in_progress":
      return "blue";
    case "not_started":
    default:
      return "gray";
  }
}

export function ExerciseProgressIndicator({
  completedSets,
  totalSets,
}: ExerciseProgressIndicatorProps) {
  const status = getProgressStatus(completedSets, totalSets);
  const color = getStatusColor(status);
  const isComplete = status === "complete";

  const tooltipLabel =
    totalSets === 0 ? "No sets added" : `${completedSets} of ${totalSets} sets completed`;

  return (
    <Tooltip label={tooltipLabel} position="top" withArrow>
      <Badge
        size="sm"
        variant={isComplete ? "filled" : "light"}
        color={color}
        className={styles.badge}
        leftSection={isComplete ? <IconCheck size={12} /> : undefined}
      >
        {isComplete ? "Done" : `${completedSets}/${totalSets}`}
      </Badge>
    </Tooltip>
  );
}
