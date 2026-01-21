/**
 * ExerciseNavigation - Horizontal scrollable navigation for workout exercises
 * Shows pill badges for each exercise with completion status
 * Allows quick navigation between exercises
 */

import { useRef, useEffect, useCallback } from "react";
import { ScrollArea, Badge, Group, Text, Box, Tooltip } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import styles from "./exercise-navigation.module.css";

export interface ExerciseNavigationItem {
  id: number;
  name: string;
  completedSets: number;
  totalSets: number;
}

export interface ExerciseNavigationProps {
  exercises: ExerciseNavigationItem[];
  currentExerciseIndex: number;
  onExerciseClick: (index: number) => void;
}

type ProgressStatus = "not_started" | "in_progress" | "complete";

/**
 * Determines the progress status based on completed vs total sets
 */
function getProgressStatus(completed: number, total: number): ProgressStatus {
  if (total === 0) return "not_started";
  if (completed === 0) return "not_started";
  if (completed >= total) return "complete";
  return "in_progress";
}

/**
 * Maps progress status to Mantine color
 */
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

/**
 * Truncates exercise name if it exceeds max length
 */
function truncateName(name: string, maxLength: number = 12): string {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength - 1)}...`;
}

export function ExerciseNavigation({
  exercises,
  currentExerciseIndex,
  onExerciseClick,
}: ExerciseNavigationProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  /**
   * Scrolls to center the current exercise pill in view
   */
  const scrollToCurrentExercise = useCallback(() => {
    const currentPill = pillRefs.current.get(currentExerciseIndex);
    if (currentPill) {
      currentPill.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentExerciseIndex]);

  // Auto-scroll to current exercise when it changes
  useEffect(() => {
    scrollToCurrentExercise();
  }, [scrollToCurrentExercise]);

  /**
   * Handles pill click - triggers callback and scrolls to pill
   */
  const handlePillClick = useCallback(
    (index: number) => {
      onExerciseClick(index);
    },
    [onExerciseClick],
  );

  /**
   * Handles keyboard navigation within the pill list
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handlePillClick(index);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        const nextIndex = Math.min(index + 1, exercises.length - 1);
        const nextPill = pillRefs.current.get(nextIndex);
        nextPill?.focus();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        const prevIndex = Math.max(index - 1, 0);
        const prevPill = pillRefs.current.get(prevIndex);
        prevPill?.focus();
      }
    },
    [handlePillClick, exercises.length],
  );

  if (exercises.length === 0) {
    return null;
  }

  return (
    <Box className={styles.container}>
      <ScrollArea
        ref={scrollAreaRef}
        type="scroll"
        scrollbarSize={6}
        offsetScrollbars={false}
        className={styles.scrollArea}
      >
        <Group
          gap="xs"
          wrap="nowrap"
          className={styles.pillContainer}
          role="tablist"
          aria-label="Exercise navigation"
        >
          {exercises.map((exercise, index) => {
            const status = getProgressStatus(exercise.completedSets, exercise.totalSets);
            const color = getStatusColor(status);
            const isComplete = status === "complete";
            const isCurrent = index === currentExerciseIndex;
            const displayName = truncateName(exercise.name);
            const isNameTruncated = exercise.name.length > 12;

            const pillContent = (
              <Badge
                component="button"
                ref={(el) => {
                  if (el) {
                    pillRefs.current.set(index, el);
                  } else {
                    pillRefs.current.delete(index);
                  }
                }}
                size={isCurrent ? "lg" : "md"}
                variant={isComplete ? "filled" : isCurrent ? "light" : "outline"}
                color={color}
                className={styles.pill}
                data-current={isCurrent}
                data-status={status}
                onClick={() => handlePillClick(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                role="tab"
                aria-selected={isCurrent}
                aria-label={`${exercise.name}, ${exercise.completedSets} of ${exercise.totalSets} sets completed${isCurrent ? ", current exercise" : ""}`}
                tabIndex={isCurrent ? 0 : -1}
                leftSection={
                  isComplete ? <IconCheck size={isCurrent ? 14 : 12} stroke={2.5} /> : undefined
                }
              >
                <Group gap={4} wrap="nowrap" className={styles.pillContent}>
                  <Text
                    component="span"
                    size={isCurrent ? "sm" : "xs"}
                    fw={isCurrent ? 600 : 500}
                    className={styles.exerciseName}
                  >
                    {displayName}
                  </Text>
                  {!isComplete && (
                    <Text component="span" size="xs" c="dimmed" className={styles.setCount}>
                      {exercise.completedSets}/{exercise.totalSets}
                    </Text>
                  )}
                </Group>
              </Badge>
            );

            // Wrap with tooltip if name is truncated
            if (isNameTruncated) {
              return (
                <Tooltip
                  key={exercise.id}
                  label={exercise.name}
                  position="bottom"
                  withArrow
                  openDelay={300}
                >
                  {pillContent}
                </Tooltip>
              );
            }

            return <Box key={exercise.id}>{pillContent}</Box>;
          })}
        </Group>
      </ScrollArea>
    </Box>
  );
}
