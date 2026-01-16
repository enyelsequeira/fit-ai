import type { KeyboardEvent, MouseEvent } from "react";
import { useMemo, useState } from "react";
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
} from "@/components/templates/hooks/use-mutations.ts";
import { useTemplateById, useTemplateFolders } from "../../queries/use-queries.ts";
import styles from "./template-card.module.css";
import { formatDuration } from "@/components/templates/utils.ts";

interface TemplateCardProps {
  templateId: number;
  onClick?: (id: number) => void;
  animationDelay?: number;
}

export function TemplateCard({ templateId, onClick, animationDelay = 0 }: TemplateCardProps) {
  // Fetch template data using hook
  const { data: template, isLoading } = useTemplateById(templateId);
  const { data: folders } = useTemplateFolders();

  // Get folder name from folders data
  const folderName = useMemo(() => {
    if (!template?.folderId || !folders) return undefined;
    const folder = folders.find((f) => f.id === template.folderId);
    return folder?.name;
  }, [template?.folderId, folders]);

  const navigate = useNavigate();

  const startWorkoutMutation = useStartWorkout();
  const deleteTemplateMutation = useDeleteTemplate();
  const duplicateTemplateMutation = useDuplicateTemplate();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const isAnyLoading =
    startWorkoutMutation.isPending ||
    deleteTemplateMutation.isPending ||
    duplicateTemplateMutation.isPending;

  const handleStartWorkout = (e: MouseEvent) => {
    e.stopPropagation();
    startWorkoutMutation.mutate(
      { id: templateId },
      {
        onSuccess: (data) => {
          navigate({ to: `/dashboard/workouts/${data.id}` as string });
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    deleteTemplateMutation.mutate(
      { id: templateId },
      {
        onSuccess: () => {
          setConfirmDeleteOpen(false);
        },
      },
    );
  };

  if (isLoading || !template) {
    return <TemplateCardSkeleton animationDelay={animationDelay} />;
  }

  const {
    name,
    description,
    estimatedDurationMinutes,
    isPublic,
    timesUsed,
    exercises = [],
  } = template;

  const isHighUsage = (timesUsed ?? 0) > 10;

  return (
    <>
      <article
        className={styles.card}
        style={{ animationDelay: `${animationDelay}ms` }}
        onClick={() => onClick?.(templateId)}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.(templateId);
          }
        }}
        data-is-public={isPublic}
        data-high-usage={isHighUsage}
        role="button"
        tabIndex={0}
        aria-label={`Template: ${name}`}
      >
        {/* Subtle glow effect */}
        <div className={styles.cardGlow} aria-hidden="true" />

        {/* Header with icon and title */}
        <div className={styles.cardHeader}>
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
        </div>

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
          {(timesUsed ?? 0) > 0 && (
            <Tooltip label="Number of times this template has been used" position="top" withArrow>
              <span className={`${styles.metaPill} ${styles.usageBadge}`}>
                <IconFlame size={12} className={styles.metaPillIcon} />
                {timesUsed} uses
              </span>
            </Tooltip>
          )}
        </div>

        {/* Stats row */}
        <div className={styles.statsRow}>
          <Tooltip label="Total exercises in template" position="top" withArrow>
            <div className={styles.statItem}>
              <IconBarbell size={14} className={styles.statIcon} />
              <span className={styles.statValue}>{exercises.length}</span>
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
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  duplicateTemplateMutation.mutate({ id: templateId });
                }}
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
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  setConfirmDeleteOpen(true);
                }}
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
