/**
 * WorkoutProgressRing - Circular progress indicator for workout completion
 * Displays completed sets out of total with color-coded feedback
 */

import { RingProgress } from "@mantine/core";

import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import styles from "./workout-progress-ring.module.css";

type WorkoutProgressRingProps = {
  completedSets: number;
  totalSets: number;
  size?: "sm" | "md";
  showLabel?: boolean;
};

const SIZE_MAP = { sm: 40, md: 56 } as const;
const THICKNESS_MAP = { sm: 4, md: 6 } as const;

/**
 * Get ring color based on completion percentage
 * - Green (teal.6) when >75% complete
 * - Blue (blue.6) when 25-75%
 * - Gray (gray.5) when <25%
 */
function getRingColor(percentage: number): string {
  if (percentage > 75) return "teal.6";
  if (percentage >= 25) return "blue.6";
  return "gray.5";
}

export function WorkoutProgressRing({
  completedSets,
  totalSets,
  size = "md",
  showLabel = true,
}: WorkoutProgressRingProps) {
  const percentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  const color = getRingColor(percentage);
  const ringSize = SIZE_MAP[size];
  const thickness = THICKNESS_MAP[size];

  return (
    <RingProgress
      size={ringSize}
      thickness={thickness}
      roundCaps
      sections={[{ value: percentage, color }]}
      rootColor="var(--ring-root-color)"
      className={styles.ring}
      label={
        showLabel ? (
          <FitAiText.Caption className={size === "sm" ? styles.labelSmall : styles.labelMedium}>
            {completedSets}/{totalSets}
          </FitAiText.Caption>
        ) : undefined
      }
    />
  );
}
