import type { KeyboardEvent, MouseEvent } from "react";
import { useMemo, useState } from "react";
import { Modal, Stack } from "@mantine/core";
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
  IconCalendarWeek,
  IconStarFilled,
  IconStar,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import {
  useDeleteTemplate,
  useDuplicateTemplate,
  useStartWorkout,
  useSetActiveTemplate,
} from "@/components/templates/hooks/use-mutations.ts";
import {
  useTemplateById,
  useTemplateFolders,
  useActiveTemplate,
} from "../../queries/use-queries.ts";
import styles from "./template-card.module.css";
import { formatDuration } from "@/components/templates/utils.ts";
import { FitAiToolTip } from "@/components/ui/fit-ai-tooltip/fit-ai-tool-tip.tsx";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text.tsx";
import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button.tsx";

interface TemplateCardProps {
  templateId: number;
  onClick?: (id: number) => void;
  animationDelay?: number;
}

export function TemplateCard({ templateId, onClick, animationDelay = 0 }: TemplateCardProps) {
  // Fetch template data using hook
  const { data: template, isLoading } = useTemplateById(templateId);
  const { data: folders } = useTemplateFolders();
  const { data: activeTemplateData } = useActiveTemplate();

  // Check if this template is the active one
  const isActive = activeTemplateData?.activeTemplateId === templateId;

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
  const setActiveTemplateMutation = useSetActiveTemplate();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const isAnyLoading =
    startWorkoutMutation.isPending ||
    deleteTemplateMutation.isPending ||
    duplicateTemplateMutation.isPending ||
    setActiveTemplateMutation.isPending;

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

  const handleSetActive = (e: MouseEvent) => {
    e.stopPropagation();
    if (!isActive) {
      setActiveTemplateMutation.mutate({ templateId });
    }
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

  // Check for multi-day template support
  const days = (template as { days?: unknown[] }).days;
  const dayCount = days?.length ?? 0;
  const hasMultipleDays = dayCount > 0;

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
        data-is-active={isActive}
        role="button"
        tabIndex={0}
        aria-label={`Template: ${name}${isActive ? " (Active)" : ""}`}
      >
        {/* Subtle glow effect */}
        <div className={styles.cardGlow} aria-hidden="true" />

        {/* ZONE 1: Header with icon and title */}
        <div className={styles.cardHeader}>
          <div className={styles.iconWrapper}>
            <IconTemplate size={18} stroke={1.5} />
          </div>
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

        {/* ZONE 2: Meta badges - compact inline */}
        <div className={styles.metaSection}>
          {isActive && (
            <FitAiToolTip
              toolTipProps={{
                label: "Active workout template",
              }}
            >
              <span className={`${styles.metaPill} ${styles.activeBadge}`}>
                <IconStarFilled size={11} className={styles.metaPillIcon} />
                Active
              </span>
            </FitAiToolTip>
          )}
          <FitAiToolTip
            toolTipProps={{
              label: isPublic ? "Public" : "Private",
            }}
          >
            <span
              className={`${styles.metaPill} ${isPublic ? styles.publicBadge : styles.privateBadge}`}
            >
              {isPublic ? <IconWorld size={11} /> : <IconLock size={11} />}
            </span>
          </FitAiToolTip>
          {folderName && (
            <FitAiToolTip
              toolTipProps={{
                label: `Folder: ${folderName}`,
              }}
            >
              <span className={`${styles.metaPill} ${styles.folderBadge}`}>
                <IconFolder size={11} className={styles.metaPillIcon} />
                {folderName}
              </span>
            </FitAiToolTip>
          )}
          {(timesUsed ?? 0) > 0 && (
            <FitAiToolTip
              toolTipProps={{
                label: `Used ${timesUsed} times`,
              }}
            >
              <span className={`${styles.metaPill} ${styles.usageBadge}`}>
                <IconFlame size={11} className={styles.metaPillIcon} />
                {timesUsed}
              </span>
            </FitAiToolTip>
          )}
        </div>

        {/* Stats row - key metrics */}
        <div className={styles.statsRow}>
          {hasMultipleDays && (
            <div className={styles.statItem}>
              <IconCalendarWeek size={12} className={styles.statIcon} />
              <span className={styles.statValue}>{dayCount}</span>
              <span className={styles.statLabel}>{dayCount === 1 ? "day" : "days"}</span>
            </div>
          )}
          <div className={styles.statItem}>
            <IconBarbell size={12} className={styles.statIcon} />
            <span className={styles.statValue}>{exercises.length}</span>
            <span className={styles.statLabel}>exercises</span>
          </div>
          {estimatedDurationMinutes && (
            <div className={styles.statItem}>
              <IconClock size={12} className={styles.statIcon} />
              <span className={styles.statValue}>{formatDuration(estimatedDurationMinutes)}</span>
            </div>
          )}
        </div>

        {/* ZONE 3: Actions bar - visible on hover */}
        <div className={styles.actionsBar}>
          <div className={styles.actionsLeft}>
            <button
              type="button"
              className={`${styles.actionButton} ${styles.primaryAction}`}
              onClick={handleStartWorkout}
              disabled={isAnyLoading}
              aria-label="Start workout"
            >
              <IconPlayerPlay size={12} />
              Start
            </button>
          </div>
          <div className={styles.actionsRight}>
            <FitAiToolTip
              toolTipProps={{
                label: isActive ? "Active" : "Set as active",
              }}
            >
              <button
                type="button"
                className={`${styles.actionButton} ${isActive ? styles.activeAction : styles.secondaryAction} ${styles.iconOnlyAction}`}
                onClick={handleSetActive}
                disabled={isAnyLoading || isActive}
                aria-label={isActive ? "Active template" : "Set as active"}
              >
                {isActive ? <IconStarFilled size={12} /> : <IconStar size={12} />}
              </button>
            </FitAiToolTip>
            <FitAiToolTip
              toolTipProps={{
                label: "Duplicate",
              }}
            >
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
                <IconCopy size={12} />
              </button>
            </FitAiToolTip>
            <FitAiToolTip
              toolTipProps={{
                label: "Delete",
              }}
            >
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
                <IconTrash size={12} />
              </button>
            </FitAiToolTip>
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
          <FitAiText variant={"body"}>Delete Template</FitAiText>
          <FitAiText variant={"muted"}>
            Are you sure you want to delete &ldquo;{name}&rdquo;? This action cannot be undone and
            all associated data will be permanently removed.
          </FitAiText>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <FitAiButton
              variant="primary"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={deleteTemplateMutation.isPending}
            >
              Cancel
            </FitAiButton>
            <FitAiButton
              variant={"danger"}
              onClick={handleConfirmDelete}
              loading={deleteTemplateMutation.isPending}
              leftSection={<IconTrash size={16} />}
            >
              Delete Template
            </FitAiButton>
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
