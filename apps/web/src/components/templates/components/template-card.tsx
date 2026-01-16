/**
 * TemplateCard - Modern template card component
 * Features:
 * - Visible actions on hover (Start Workout, Duplicate, Delete)
 * - Exercise preview chips
 * - Visual hierarchy with duration, folder, and usage stats
 * - Smooth animations and micro-interactions
 * - Keyboard accessible
 */

import type { KeyboardEvent, MouseEvent } from "react";
import { useCallback, useState } from "react";
import { Tooltip, Modal, Stack, Text, Button } from "@mantine/core";
import {
  IconTemplate,
  IconClock,
  IconWorld,
  IconLock,
  IconPlayerPlay,
  IconCopy,
  IconTrash,
  IconBarbell,
  IconFlame,
  IconFolder,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import {
  useDeleteTemplate,
  useDuplicateTemplate,
  useStartWorkout,
} from "@/components/templates/hooks/use-mutations";
import styles from "./template-card.module.css";

// ============================================================================
// Types
// ============================================================================

interface TemplateExercise {
  id: number;
  exercise?: {
    id: number;
    name: string;
    category: string;
    exerciseType: string;
  };
}

export interface TemplateCardData {
  id: number;
  name: string;
  description: string | null;
  estimatedDurationMinutes: number | null;
  isPublic: boolean;
  usageCount: number;
  exerciseCount?: number;
  exercises?: TemplateExercise[];
}

interface TemplateCardProps {
  /** Template data object */
  template: TemplateCardData;
  /** Folder name for badge display */
  folderName?: string;
  /** Callback when card body is clicked (opens detail modal) */
  onClick?: (id: number) => void;
  /** Animation delay in ms for stagger effect */
  animationDelay?: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDuration(minutes: number | null): string {
  if (!minutes) return "-";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// ============================================================================
// Component
// ============================================================================

export function TemplateCard({
  template,
  folderName,
  onClick,
  animationDelay = 0,
}: TemplateCardProps) {
  const {
    id,
    name,
    description,
    estimatedDurationMinutes,
    isPublic,
    usageCount,
    exerciseCount,
    exercises = [],
  } = template;

  const navigate = useNavigate();
  const isHighUsage = usageCount > 10;

  // Prepare exercise preview
  const displayExercises = exercises.slice(0, 3);
  const remainingExercises = exercises.length > 3 ? exercises.length - 3 : 0;

  // Mutations
  const startWorkoutMutation = useStartWorkout();
  const deleteTemplateMutation = useDeleteTemplate();
  const duplicateTemplateMutation = useDuplicateTemplate();

  // Confirmation dialog state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const isAnyLoading =
    startWorkoutMutation.isPending ||
    deleteTemplateMutation.isPending ||
    duplicateTemplateMutation.isPending;

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleCardClick = useCallback(() => {
    onClick?.(id);
  }, [id, onClick]);

  const handleCardKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCardClick();
      }
    },
    [handleCardClick],
  );

  const handleStartWorkout = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      startWorkoutMutation.mutate(
        { id },
        {
          onSuccess: (data) => {
            navigate({ to: `/dashboard/workouts/${data.id}` as string });
          },
        },
      );
    },
    [id, startWorkoutMutation, navigate],
  );

  const handleDuplicate = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      duplicateTemplateMutation.mutate({ id });
    },
    [id, duplicateTemplateMutation],
  );

  const handleDeleteClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    deleteTemplateMutation.mutate(
      { id },
      {
        onSuccess: () => {
          setConfirmDeleteOpen(false);
        },
      },
    );
  }, [id, deleteTemplateMutation]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      <article
        className={styles.card}
        style={{ animationDelay: `${animationDelay}ms` }}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        data-is-public={isPublic}
        data-high-usage={isHighUsage}
        role="button"
        tabIndex={0}
        aria-label={`Template: ${name}`}
      >
        {/* Subtle glow effect */}
        <div className={styles.cardGlow} aria-hidden="true" />

        {/* Header with icon and title */}
        <header className={styles.cardHeader}>
          <Tooltip label="Workout template" position="top" withArrow>
            <div className={styles.iconWrapper}>
              <IconTemplate size={22} stroke={1.5} />
            </div>
          </Tooltip>
          <div className={styles.headerContent}>
            <h3 className={styles.templateName} title={name}>
              {name}
            </h3>
            {description && (
              <p className={styles.description} title={description}>
                {description}
              </p>
            )}
          </div>
        </header>

        {/* Meta pills section */}
        <div className={styles.metaSection}>
          {estimatedDurationMinutes && (
            <Tooltip label="Estimated workout duration" position="top" withArrow>
              <span className={styles.metaPill}>
                <IconClock size={12} className={styles.metaPillIcon} />
                {formatDuration(estimatedDurationMinutes)}
              </span>
            </Tooltip>
          )}
          {folderName && (
            <Tooltip label="Folder" position="top" withArrow>
              <span className={`${styles.metaPill} ${styles.folderBadge}`}>
                <IconFolder size={12} className={styles.metaPillIcon} />
                {folderName}
              </span>
            </Tooltip>
          )}
          <Tooltip
            label={isPublic ? "Visible to everyone" : "Only visible to you"}
            position="top"
            withArrow
          >
            <span
              className={`${styles.metaPill} ${isPublic ? styles.publicBadge : styles.privateBadge}`}
            >
              {isPublic ? (
                <>
                  <IconWorld size={12} className={styles.metaPillIcon} />
                  Public
                </>
              ) : (
                <>
                  <IconLock size={12} className={styles.metaPillIcon} />
                  Private
                </>
              )}
            </span>
          </Tooltip>
          {usageCount > 0 && (
            <Tooltip label="Number of times this template has been used" position="top" withArrow>
              <span className={`${styles.metaPill} ${styles.usageBadge}`}>
                <IconFlame size={12} className={styles.metaPillIcon} />
                {usageCount} uses
              </span>
            </Tooltip>
          )}
        </div>

        {/* Exercise preview chips */}
        {displayExercises.length > 0 && (
          <div className={styles.exercisePreview}>
            <div className={styles.exercisePreviewLabel}>Exercises</div>
            <div className={styles.exerciseChips}>
              {displayExercises.map((ex) => (
                <span key={ex.id} className={styles.exerciseChip}>
                  {ex.exercise?.name ?? "Unknown"}
                </span>
              ))}
              {remainingExercises > 0 && (
                <span className={`${styles.exerciseChip} ${styles.moreExercises}`}>
                  +{remainingExercises} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className={styles.statsRow}>
          <Tooltip label="Total exercises in template" position="top" withArrow>
            <div className={styles.statItem}>
              <IconBarbell size={14} className={styles.statIcon} />
              <span className={styles.statValue}>{exerciseCount ?? exercises.length}</span>
              <span className={styles.statLabel}>exercises</span>
            </div>
          </Tooltip>
          {estimatedDurationMinutes && (
            <Tooltip label="Estimated completion time" position="top" withArrow>
              <div className={styles.statItem}>
                <IconClock size={14} className={styles.statIcon} />
                <span className={styles.statValue}>{formatDuration(estimatedDurationMinutes)}</span>
                <span className={styles.statLabel}>duration</span>
              </div>
            </Tooltip>
          )}
        </div>

        {/* Actions bar - visible on hover */}
        <div className={styles.actionsBar}>
          <div className={styles.actionsLeft}>
            <Tooltip label="Start a workout using this template" position="top" withArrow>
              <button
                type="button"
                className={`${styles.actionButton} ${styles.primaryAction}`}
                onClick={handleStartWorkout}
                disabled={isAnyLoading}
                aria-label="Start workout"
              >
                <IconPlayerPlay size={14} />
                Start Workout
              </button>
            </Tooltip>
          </div>
          <div className={styles.actionsRight}>
            <Tooltip label="Create a copy of this template" position="top" withArrow>
              <button
                type="button"
                className={`${styles.actionButton} ${styles.secondaryAction} ${styles.iconOnlyAction}`}
                onClick={handleDuplicate}
                disabled={isAnyLoading}
                aria-label="Duplicate template"
              >
                <IconCopy size={14} />
              </button>
            </Tooltip>
            <Tooltip label="Permanently delete this template" position="top" withArrow>
              <button
                type="button"
                className={`${styles.actionButton} ${styles.dangerAction} ${styles.iconOnlyAction}`}
                onClick={handleDeleteClick}
                disabled={isAnyLoading}
                aria-label="Delete template"
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
            Delete Template
          </Text>
          <Text size="sm" c="dimmed">
            Are you sure you want to delete &ldquo;{name}&rdquo;? This action cannot be undone and
            all associated data will be permanently removed.
          </Text>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Button
              variant="default"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={deleteTemplateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleConfirmDelete}
              loading={deleteTemplateMutation.isPending}
              leftSection={<IconTrash size={16} />}
            >
              Delete Template
            </Button>
          </div>
        </Stack>
      </Modal>
    </>
  );
}

// ============================================================================
// Skeleton Component
// ============================================================================

export function TemplateCardSkeleton({ animationDelay = 0 }: { animationDelay?: number }) {
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
        <div className={`${styles.skeleton} ${styles.skeletonPill}`} />
      </div>
      <div className={styles.skeletonStats}>
        <div className={`${styles.skeleton} ${styles.skeletonStat}`} />
        <div className={`${styles.skeleton} ${styles.skeletonStat}`} />
      </div>
    </div>
  );
}

// Re-export list item components for convenience
export { TemplateListItem, TemplateListItemSkeleton } from "./template-list-item";
export type { TemplateListItemData } from "./template-list-item";
