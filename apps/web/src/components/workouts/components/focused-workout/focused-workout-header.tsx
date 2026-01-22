/**
 * FocusedWorkoutHeader - Gym Mode sticky header
 * Displays workout name, elapsed time, and exercise dot indicators
 */

import { IconChevronLeft } from "@tabler/icons-react";

import { FitAiActionIcon } from "@/components/ui/fit-ai-button/fit-ai-action-icon";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import styles from "./focused-workout-header.module.css";

interface FocusedWorkoutHeaderProps {
  workoutName: string;
  elapsedTime: number;
  currentExerciseIndex: number;
  totalExercises: number;
  completedExerciseIndexes: number[];
  onBackClick: () => void;
}

function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function FocusedWorkoutHeader({
  workoutName,
  elapsedTime,
  currentExerciseIndex,
  totalExercises,
  completedExerciseIndexes,
  onBackClick,
}: FocusedWorkoutHeaderProps) {
  // Generate dot indicators
  const dots = Array.from({ length: totalExercises }, (_, index) => {
    const isCompleted = completedExerciseIndexes.includes(index);
    const isCurrent = index === currentExerciseIndex;
    return { index, isCompleted, isCurrent };
  });

  return (
    <header className={styles.header}>
      <FitAiActionIcon
        variant="ghost"
        className={styles.backButton}
        onClick={onBackClick}
        aria-label="Go back"
      >
        <IconChevronLeft size={24} />
      </FitAiActionIcon>

      <div className={styles.centerContent}>
        <FitAiText.Subheading className={styles.workoutName}>{workoutName}</FitAiText.Subheading>
        <FitAiText.Caption className={styles.elapsedTime}>
          {formatElapsedTime(elapsedTime)}
        </FitAiText.Caption>
      </div>

      <div className={styles.dots}>
        {dots.map((dot) => (
          <div
            key={dot.index}
            className={styles.dot}
            data-completed={dot.isCompleted ? "true" : undefined}
            data-current={dot.isCurrent ? "true" : undefined}
            aria-label={`Exercise ${dot.index + 1}${dot.isCompleted ? " (completed)" : dot.isCurrent ? " (current)" : ""}`}
          />
        ))}
      </div>
    </header>
  );
}
