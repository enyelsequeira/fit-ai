/**
 * TemplateActions - Action component for templates with multiple display variants
 */
import { useState, useCallback } from "react";
import { ActionIcon, Button, Group, Menu, Modal, Stack, Text, Tooltip } from "@mantine/core";
import {
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconPlayerPlay,
  IconTrash,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import {
  useDeleteTemplate,
  useDuplicateTemplate,
  useStartWorkout,
} from "@/components/templates/hooks/use-mutations";
import styles from "./template-actions.module.css";

export type TemplateActionsVariant = "modal" | "card" | "compact";

export interface TemplateActionsProps {
  templateId: number;
  variant?: TemplateActionsVariant;
  showLabels?: boolean;
  showEdit?: boolean;
  onActionComplete?: () => void;
  onClose?: () => void;
  className?: string;
  iconSize?: number;
  useDropdownMenu?: boolean;
}

interface ConfirmationState {
  isOpen: boolean;
  action: "delete" | null;
  title: string;
  message: string;
}

export function TemplateActions({
  templateId,
  variant = "modal",
  showLabels = true,
  showEdit = false,
  onActionComplete,
  onClose,
  className,
  iconSize = 16,
  useDropdownMenu,
}: TemplateActionsProps) {
  const navigate = useNavigate();
  const startWorkoutMutation = useStartWorkout();
  const deleteTemplateMutation = useDeleteTemplate();
  const duplicateTemplateMutation = useDuplicateTemplate();

  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    action: null,
    title: "",
    message: "",
  });

  const shouldUseDropdown = useDropdownMenu ?? variant === "card";
  const isAnyLoading =
    startWorkoutMutation.isPending ||
    deleteTemplateMutation.isPending ||
    duplicateTemplateMutation.isPending;

  const handleStartWorkout = useCallback(() => {
    startWorkoutMutation.mutate(
      { id: templateId },
      {
        onSuccess: (data) => {
          onClose?.();
          onActionComplete?.();
          navigate({ to: `/dashboard/workouts/${data.id}` as string });
        },
      },
    );
  }, [templateId, startWorkoutMutation, navigate, onClose, onActionComplete]);

  const handleDuplicate = useCallback(() => {
    duplicateTemplateMutation.mutate(
      { id: templateId },
      { onSuccess: () => onActionComplete?.() },
    );
  }, [templateId, duplicateTemplateMutation, onActionComplete]);

  const handleEdit = useCallback(() => {
    onClose?.();
    navigate({ to: `/dashboard/templates/${templateId}/edit` as string });
  }, [templateId, navigate, onClose]);

  const openDeleteConfirmation = useCallback(() => {
    setConfirmation({
      isOpen: true,
      action: "delete",
      title: "Delete Template",
      message:
        "Are you sure you want to delete this template? This action cannot be undone and all associated data will be permanently removed.",
    });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    deleteTemplateMutation.mutate(
      { id: templateId },
      {
        onSuccess: () => {
          setConfirmation((prev) => ({ ...prev, isOpen: false }));
          onClose?.();
          onActionComplete?.();
        },
      },
    );
  }, [templateId, deleteTemplateMutation, onClose, onActionComplete]);

  const closeConfirmation = useCallback(() => {
    setConfirmation((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const confirmationModal = (
    <Modal opened={confirmation.isOpen} onClose={closeConfirmation} title={null} centered size="sm" withCloseButton={false}>
      <Stack gap="md" className={styles.confirmationContent}>
        <div className={styles.confirmationIconDanger}>
          <IconAlertTriangle size={32} stroke={1.5} />
        </div>
        <Text size="lg" className={styles.confirmationTitle}>{confirmation.title}</Text>
        <Text size="sm" className={styles.confirmationMessage}>{confirmation.message}</Text>
        <div className={styles.confirmationActions}>
          <Button variant="default" onClick={closeConfirmation} disabled={deleteTemplateMutation.isPending}>
            Cancel
          </Button>
          <Button color="red" onClick={handleConfirmDelete} loading={deleteTemplateMutation.isPending} leftSection={<IconTrash size={16} />}>
            Delete Template
          </Button>
        </div>
      </Stack>
    </Modal>
  );

  // Compact variant - icon-only with tooltips
  if (variant === "compact") {
    return (
      <>
        <div className={`${styles.actionsContainer} ${styles.compact} ${className ?? ""}`} data-loading={isAnyLoading}>
          <Tooltip label="Start Workout" position="top" withArrow>
            <ActionIcon variant="subtle" color="green" size="sm" onClick={handleStartWorkout} loading={startWorkoutMutation.isPending} disabled={isAnyLoading} className={styles.actionIconStart} aria-label="Start workout from template">
              <IconPlayerPlay size={iconSize} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Duplicate" position="top" withArrow>
            <ActionIcon variant="subtle" size="sm" onClick={handleDuplicate} loading={duplicateTemplateMutation.isPending} disabled={isAnyLoading} className={styles.actionIconDuplicate} aria-label="Duplicate template">
              <IconCopy size={iconSize} />
            </ActionIcon>
          </Tooltip>
          {showEdit && (
            <Tooltip label="Edit" position="top" withArrow>
              <ActionIcon variant="subtle" size="sm" onClick={handleEdit} disabled={isAnyLoading} className={styles.actionIconEdit} aria-label="Edit template">
                <IconEdit size={iconSize} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Delete" position="top" withArrow>
            <ActionIcon variant="subtle" color="red" size="sm" onClick={openDeleteConfirmation} disabled={isAnyLoading} className={styles.actionIconDelete} aria-label="Delete template">
              <IconTrash size={iconSize} />
            </ActionIcon>
          </Tooltip>
        </div>
        {confirmationModal}
      </>
    );
  }

  // Card variant with dropdown menu
  if (shouldUseDropdown) {
    return (
      <>
        <div className={`${styles.actionsContainer} ${styles.card} ${className ?? ""}`} data-loading={isAnyLoading}>
          <Tooltip label="Start a workout from this template" position="top" withArrow>
            <Button size="xs" color="green" leftSection={<IconPlayerPlay size={14} />} onClick={handleStartWorkout} loading={startWorkoutMutation.isPending} disabled={isAnyLoading && !startWorkoutMutation.isPending} className={styles.primaryAction}>
              {showLabels && "Start"}
            </Button>
          </Tooltip>
          <Menu shadow="md" position="bottom-end" withinPortal>
            <Menu.Target>
              <Tooltip label="More actions" position="top" withArrow>
                <ActionIcon variant="subtle" size="sm" disabled={isAnyLoading} className={styles.moreActionsTrigger} aria-label="More actions">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown className={styles.menuDropdown}>
              <Menu.Item leftSection={<IconCopy size={14} />} onClick={handleDuplicate} disabled={duplicateTemplateMutation.isPending} className={styles.menuItem}>
                Duplicate
              </Menu.Item>
              {showEdit && (
                <Menu.Item leftSection={<IconEdit size={14} />} onClick={handleEdit} className={styles.menuItem}>
                  Edit
                </Menu.Item>
              )}
              <Menu.Divider className={styles.menuDivider} />
              <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={openDeleteConfirmation} className={styles.menuItemDanger}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
        {confirmationModal}
      </>
    );
  }

  // Modal variant - full button group
  return (
    <>
      <Group gap="sm" className={`${styles.actionsContainer} ${styles.modal} ${className ?? ""}`} data-loading={isAnyLoading}>
        <Tooltip label="Start a workout from this template" position="top" withArrow>
          <Button color="green" leftSection={<IconPlayerPlay size={iconSize} />} onClick={handleStartWorkout} loading={startWorkoutMutation.isPending} disabled={isAnyLoading && !startWorkoutMutation.isPending} className={styles.primaryAction}>
            Start Workout
          </Button>
        </Tooltip>
        <Tooltip label="Create a copy of this template" position="top" withArrow>
          <Button variant="light" leftSection={<IconCopy size={iconSize} />} onClick={handleDuplicate} loading={duplicateTemplateMutation.isPending} disabled={isAnyLoading && !duplicateTemplateMutation.isPending} className={styles.secondaryAction}>
            Duplicate
          </Button>
        </Tooltip>
        {showEdit && (
          <Tooltip label="Edit this template" position="top" withArrow>
            <Button variant="light" leftSection={<IconEdit size={iconSize} />} onClick={handleEdit} disabled={isAnyLoading} className={styles.secondaryAction}>
              Edit
            </Button>
          </Tooltip>
        )}
        <Tooltip label="Permanently delete this template" position="top" withArrow>
          <Button variant="light" color="red" leftSection={<IconTrash size={iconSize} />} onClick={openDeleteConfirmation} disabled={isAnyLoading} className={styles.secondaryAction}>
            Delete
          </Button>
        </Tooltip>
      </Group>
      {confirmationModal}
    </>
  );
}
