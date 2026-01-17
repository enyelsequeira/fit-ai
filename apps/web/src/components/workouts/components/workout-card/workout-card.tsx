/**
 * WorkoutCard - Individual workout card component
 * Displays workout summary with name, date, duration, exercises, status, and actions
 */

import type { KeyboardEvent, MouseEvent } from "react";
import { useState } from "react";
import { Tooltip, Modal, Stack, Text, Button } from "@mantine/core";
import {
  IconBarbell,
  IconClock,
  IconCheck,
  IconPlayerPlay,
  IconCalendar,
  IconTrash,
  IconStar,
  IconAlertTriangle,
  IconMoodSmile,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useDeleteWorkout } from "../../hooks/use-mutations.ts";
import { useWorkoutById } from "../../queries/use-queries.ts";
import { formatRelativeDate, formatDuration, calculateWorkoutDuration, countSets } from "../../utils";
import { MOOD_LABELS, MOOD_COLORS } from "../../types";
import type { WorkoutMood } from "../../types";
import styles from "./workout-card.module.css";

interface WorkoutCardProps {
  workoutId: number;
  onClick?: (id: number) => void;
  animationDelay?: number;
}

export function WorkoutCard({ workoutId, onClick, animationDelay = 0 }: WorkoutCardProps) {
  const navigate = useNavigate();
  const { data: workout, isLoading } = useWorkoutById(workoutId);
  const deleteWorkoutMutation = useDeleteWorkout();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleContinueWorkout = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({ to: `/dashboard/workouts/${workoutId}` as string });
  };

  const handleConfirmDelete = () => {
    deleteWorkoutMutation.mutate(
      { workoutId },
      {
        onSuccess: () => {
          setConfirmDeleteOpen(false);
        },
      },
    );
  };

  if (isLoading || !workout) {
    return <WorkoutCardSkeleton animationDelay={animationDelay} />;
  }

  const {
    name,
    startedAt,
    completedAt,
    rating,
    mood,
    workoutExercises,
  } = workout;

  const isCompleted = completedAt !== null;
  const duration = calculateWorkoutDuration(startedAt, completedAt);
  const exerciseCount = workoutExercises?.length ?? 0;
  const { total: setCount, completed: completedSets } = countSets(workoutExercises);

  return (
    <>
      <article
        className={styles.card}
        style={{ animationDelay: `${animationDelay}ms` }}
        onClick={() => onClick?.(workoutId)}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.(workoutId);
          }
        }}
        data-completed={isCompleted}
        role="button"
        tabIndex={0}
        aria-label={`Workout: ${name ?? "Untitled Workout"}`}
      >
        {/* Subtle glow effect */}
        <div className={styles.cardGlow} aria-hidden="true" />

        {/* Header with icon and title */}
        <div className={styles.cardHeader}>
          <Tooltip label="Workout session" position="top" withArrow>
            <div className={styles.iconWrapper} data-completed={isCompleted}>
              <IconBarbell size={22} stroke={1.5} />
            </div>
          </Tooltip>
          <div className={styles.headerContent}>
            <h3 className={styles.workoutName} title={name ?? "Untitled Workout"}>
              {name ?? "Untitled Workout"}
            </h3>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}>
                <IconCalendar size={12} />
                {formatRelativeDate(startedAt)}
              </span>
              {duration && (
                <span className={styles.metaItem}>
                  <IconClock size={12} />
                  {formatDuration(duration)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Meta pills section */}
        <div className={styles.metaSection}>
          <Tooltip
            label={isCompleted ? "Workout completed" : "Workout in progress"}
            position="top"
            withArrow
          >
            <span className={`${styles.metaPill} ${isCompleted ? styles.completedBadge : styles.inProgressBadge}`}>
              {isCompleted ? (
                <>
                  <IconCheck size={12} className={styles.metaPillIcon} />
                  Completed
                </>
              ) : (
                <>
                  <IconPlayerPlay size={12} className={styles.metaPillIcon} />
                  In Progress
                </>
              )}
            </span>
          </Tooltip>

          {isCompleted && rating && (
            <Tooltip label="Workout rating" position="top" withArrow>
              <span className={`${styles.metaPill} ${styles.ratingBadge}`}>
                <IconStar size={12} className={styles.metaPillIcon} />
                {rating}/5
              </span>
            </Tooltip>
          )}

          {isCompleted && mood && (
            <Tooltip label={`Mood: ${MOOD_LABELS[mood as WorkoutMood] ?? mood}`} position="top" withArrow>
              <span
                className={styles.metaPill}
                style={{
                  background: `var(--mantine-color-${MOOD_COLORS[mood as WorkoutMood] ?? "gray"}-1)`,
                  color: `var(--mantine-color-${MOOD_COLORS[mood as WorkoutMood] ?? "gray"}-7)`,
                }}
              >
                <IconMoodSmile size={12} className={styles.metaPillIcon} />
                {MOOD_LABELS[mood as WorkoutMood] ?? mood}
              </span>
            </Tooltip>
          )}
        </div>

        {/* Stats row */}
        <div className={styles.statsRow}>
          <Tooltip label="Total exercises in workout" position="top" withArrow>
            <div className={styles.statItem}>
              <IconBarbell size={14} className={styles.statIcon} />
              <span className={styles.statValue}>{exerciseCount}</span>
              <span className={styles.statLabel}>exercises</span>
            </div>
          </Tooltip>

          <Tooltip label={`${completedSets} of ${setCount} sets completed`} position="top" withArrow>
            <div className={styles.statItem}>
              <IconCheck size={14} className={styles.statIcon} />
              <span className={styles.statValue}>{completedSets}/{setCount}</span>
              <span className={styles.statLabel}>sets</span>
            </div>
          </Tooltip>

          {duration && (
            <Tooltip label="Workout duration" position="top" withArrow>
              <div className={styles.statItem}>
                <IconClock size={14} className={styles.statIcon} />
                <span className={styles.statValue}>{formatDuration(duration)}</span>
                <span className={styles.statLabel}>duration</span>
              </div>
            </Tooltip>
          )}
        </div>

        {/* Actions bar - visible on hover */}
        <div className={styles.actionsBar}>
          <div className={styles.actionsLeft}>
            {!isCompleted && (
              <Tooltip label="Continue this workout" position="top" withArrow>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.primaryAction}`}
                  onClick={handleContinueWorkout}
                  disabled={deleteWorkoutMutation.isPending}
                  aria-label="Continue workout"
                >
                  <IconPlayerPlay size={14} />
                  Continue
                </button>
              </Tooltip>
            )}
            {isCompleted && (
              <Tooltip label="View workout details" position="top" withArrow>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.secondaryAction}`}
                  onClick={handleContinueWorkout}
                  disabled={deleteWorkoutMutation.isPending}
                  aria-label="View details"
                >
                  View Details
                </button>
              </Tooltip>
            )}
          </div>
          <div className={styles.actionsRight}>
            <Tooltip label="Delete this workout" position="top" withArrow>
              <button
                type="button"
                className={`${styles.actionButton} ${styles.dangerAction} ${styles.iconOnlyAction}`}
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  setConfirmDeleteOpen(true);
                }}
                disabled={deleteWorkoutMutation.isPending}
                aria-label="Delete workout"
              >
                <IconTrash size={14} />
              </button>
            </Tooltip>
          </div>
        </div>
      </article>

      {/* Delete confirmation modal */}
      <Modal
        opened={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title={null}
        centered
        size="sm"
        withCloseButton={false}
      >
        <Stack gap="md" align="center" ta="center">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--mantine-color-red-1)",
              color: "var(--mantine-color-red-6)",
            }}
          >
            <IconAlertTriangle size={32} stroke={1.5} />
          </div>
          <Text size="lg" fw={600}>
            Delete Workout
          </Text>
          <Text size="sm" c="dimmed">
            Are you sure you want to delete &ldquo;{name ?? "this workout"}&rdquo;? This action cannot be undone and
            all associated data will be permanently removed.
          </Text>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Button
              variant="default"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={deleteWorkoutMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleConfirmDelete}
              loading={deleteWorkoutMutation.isPending}
              leftSection={<IconTrash size={16} />}
            >
              Delete Workout
            </Button>
          </div>
        </Stack>
      </Modal>
    </>
  );
}

export function WorkoutCardSkeleton({ animationDelay = 0 }: { animationDelay?: number }) {
  return (
    <div
      className={styles.skeletonCard}
      style={{ animationDelay: `${animationDelay}ms` }}
      aria-hidden="true"
    >
      <div className={styles.skeletonHeader}>
        <div className={`${styles.skeleton} ${styles.skeletonIcon}`} />
        <div className={styles.skeletonContent}>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
          <div className={`${styles.skeleton} ${styles.skeletonDesc}`} />
        </div>
      </div>
      <div className={styles.skeletonMeta}>
        <div className={`${styles.skeleton} ${styles.skeletonPill}`} />
        <div className={`${styles.skeleton} ${styles.skeletonPill}`} />
      </div>
      <div className={styles.skeletonStats}>
        <div className={`${styles.skeleton} ${styles.skeletonStat}`} />
        <div className={`${styles.skeleton} ${styles.skeletonStat}`} />
        <div className={`${styles.skeleton} ${styles.skeletonStat}`} />
      </div>
    </div>
  );
}
