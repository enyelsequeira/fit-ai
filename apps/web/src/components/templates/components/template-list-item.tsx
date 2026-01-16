/**
 * TemplateListItem - List view component for templates
 * Compact row layout with hover actions
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
  IconFlame,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import {
  useDeleteTemplate,
  useDuplicateTemplate,
  useStartWorkout,
} from "@/components/templates/hooks/use-mutations";
import styles from "./template-list-item.module.css";

// ============================================================================
// Types
// ============================================================================

export interface TemplateListItemData {
  id: number;
  name: string;
  description: string | null;
  estimatedDurationMinutes: number | null;
  isPublic: boolean;
  usageCount: number;
  exerciseCount?: number;
}

interface TemplateListItemProps {
  /** Template data */
  template: TemplateListItemData;
  /** Callback when item is clicked (opens detail view) */
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

export function TemplateListItem({
  template,
  onClick,
  animationDelay = 0,
}: TemplateListItemProps) {
  const { id, name, description, estimatedDurationMinutes, isPublic, usageCount } = template;

  const navigate = useNavigate();
  const startWorkoutMutation = useStartWorkout();
  const deleteTemplateMutation = useDeleteTemplate();
  const duplicateTemplateMutation = useDuplicateTemplate();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const isAnyLoading =
    startWorkoutMutation.isPending ||
    deleteTemplateMutation.isPending ||
    duplicateTemplateMutation.isPending;

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleClick = useCallback(() => {
    onClick?.(id);
  }, [id, onClick]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
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
      <div
        className={styles.listItem}
        style={{ animationDelay: `${animationDelay}ms` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Template: ${name}`}
      >
        <Tooltip label="Template" position="top" withArrow>
          <div className={styles.listItemIcon}>
            <IconTemplate size={18} />
          </div>
        </Tooltip>

        <div className={styles.listItemContent}>
          <div className={styles.listItemTitle}>{name}</div>
          {description && <div className={styles.listItemDescription}>{description}</div>}
        </div>

        <div className={styles.listItemMeta}>
          {estimatedDurationMinutes && (
            <Tooltip label="Estimated duration" position="top" withArrow>
              <span className={styles.listItemPill}>
                <IconClock size={12} />
                {formatDuration(estimatedDurationMinutes)}
              </span>
            </Tooltip>
          )}
          <Tooltip label={isPublic ? "Publicly visible" : "Only you can see this"} position="top" withArrow>
            <span className={styles.listItemPill}>
              {isPublic ? <IconWorld size={12} /> : <IconLock size={12} />}
              {isPublic ? "Public" : "Private"}
            </span>
          </Tooltip>
          <Tooltip label="Times used" position="top" withArrow>
            <span className={styles.listItemPill}>
              <IconFlame size={12} />
              {usageCount}
            </span>
          </Tooltip>
        </div>

        <div className={styles.listItemActions}>
          <Tooltip label="Start a workout using this template" position="top" withArrow>
            <button
              type="button"
              className={`${styles.listActionButton} ${styles.primaryListAction}`}
              onClick={handleStartWorkout}
              disabled={isAnyLoading}
              aria-label="Start workout"
            >
              <IconPlayerPlay size={14} />
            </button>
          </Tooltip>
          <Tooltip label="Create a copy of this template" position="top" withArrow>
            <button
              type="button"
              className={styles.listActionButton}
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
              className={`${styles.listActionButton} ${styles.dangerListAction}`}
              onClick={handleDeleteClick}
              disabled={isAnyLoading}
              aria-label="Delete template"
            >
              <IconTrash size={14} />
            </button>
          </Tooltip>
        </div>
      </div>

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
            Are you sure you want to delete &ldquo;{name}&rdquo;? This action cannot be undone.
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
              Delete
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

export function TemplateListItemSkeleton() {
  return (
    <div className={styles.listItemSkeleton} aria-hidden="true">
      <div className={`${styles.skeleton} ${styles.listItemSkeletonIcon}`} />
      <div className={styles.listItemSkeletonContent}>
        <div className={`${styles.skeleton} ${styles.listItemSkeletonTitle}`} />
        <div className={`${styles.skeleton} ${styles.listItemSkeletonDesc}`} />
      </div>
      <div className={styles.listItemSkeletonMeta}>
        <div className={`${styles.skeleton} ${styles.listItemSkeletonPill}`} />
        <div className={`${styles.skeleton} ${styles.listItemSkeletonPill}`} />
      </div>
    </div>
  );
}
