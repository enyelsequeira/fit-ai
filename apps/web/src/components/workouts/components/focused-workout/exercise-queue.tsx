/**
 * ExerciseQueue - Collapsible list showing all exercises in the workout
 * Shows completed, current, and pending exercises with progress indicators
 */

import { Collapse } from "@mantine/core";
import { IconCheck, IconArrowRight } from "@tabler/icons-react";

import styles from "./exercise-queue.module.css";

export interface ExerciseQueueItem {
  id: number;
  name: string;
  completedSets: number;
  totalSets: number;
  status: "completed" | "current" | "pending";
}

interface ExerciseQueueProps {
  exercises: ExerciseQueueItem[];
  currentIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectExercise: (index: number) => void;
}

function StatusIcon({ status }: { status: ExerciseQueueItem["status"] }) {
  return (
    <div className={styles.statusIcon} data-status={status}>
      {status === "completed" && <IconCheck size={14} stroke={3} />}
      {status === "current" && <IconArrowRight size={14} stroke={3} />}
      {status === "pending" && null}
    </div>
  );
}

export function ExerciseQueue({
  exercises,
  currentIndex,
  isExpanded,
  onToggle,
  onSelectExercise,
}: ExerciseQueueProps) {
  void currentIndex; // May be used for scroll-to-current in future

  // Count remaining exercises (not including current)
  const remainingCount = exercises.filter(
    (e) => e.status === "pending" || e.status === "current",
  ).length;

  const pendingOnly = remainingCount - 1; // Exclude current from "more" count

  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isExpanded}
        aria-controls="exercise-queue-list"
      >
        <span className={styles.headerText}>
          {isExpanded ? "▲" : "▼"}{" "}
          {pendingOnly > 0
            ? `${pendingOnly} more exercise${pendingOnly !== 1 ? "s" : ""}`
            : "All exercises"}
        </span>
        <span className={styles.toggleText}>{isExpanded ? "Collapse" : "Expand"}</span>
      </div>

      <Collapse in={isExpanded}>
        <div className={styles.list} id="exercise-queue-list">
          {exercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className={styles.exerciseItem}
              data-status={exercise.status}
              onClick={() => onSelectExercise(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectExercise(index);
                }
              }}
              aria-label={`${exercise.name}, ${exercise.completedSets} of ${exercise.totalSets} sets completed`}
            >
              <StatusIcon status={exercise.status} />
              <span className={styles.exerciseName}>{exercise.name}</span>
              <span className={styles.exerciseProgress}>
                {exercise.completedSets}/{exercise.totalSets} sets
              </span>
            </div>
          ))}
        </div>
      </Collapse>
    </div>
  );
}
