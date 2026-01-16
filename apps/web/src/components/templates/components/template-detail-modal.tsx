/**
 * TemplateDetailModal - Modern redesigned template detail view
 * Focuses on exercise management with clean visual hierarchy
 */

import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Loader,
  Modal,
  ScrollArea,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import {
  IconBarbell,
  IconLayoutList,
  IconPlus,
  IconTemplate,
} from "@tabler/icons-react";
import { useTemplateById } from "../queries/use-queries";
import { AddExerciseInline } from "./add-exercise-inline";
import { ExerciseItem } from "./exercise-item";
import { InlineEditForm } from "./inline-edit-form";
import { ModalHeader } from "./modal-header";
import type { TemplateExercise } from "../types";
import styles from "./template-detail-modal.module.css";

interface TemplateDetailModalProps {
  opened: boolean;
  onClose: () => void;
  templateId: number | null;
}

export function TemplateDetailModal({ opened, onClose, templateId }: TemplateDetailModalProps) {
  const [editingExerciseId, setEditingExerciseId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>("exercises");

  const templateQuery = useTemplateById(templateId);
  const template = templateQuery.data;
  const isLoading = templateQuery.isLoading;

  const excludeExerciseIds = useMemo(
    () => template?.exercises.map((e) => e.exerciseId) ?? [],
    [template?.exercises],
  );

  const handleCloseModal = useCallback(() => {
    setEditingExerciseId(null);
    setActiveTab("exercises");
    onClose();
  }, [onClose]);

  return (
    <Modal
      opened={opened}
      onClose={handleCloseModal}
      size="lg"
      padding="lg"
      radius="lg"
      withCloseButton={false}
      styles={{
        body: { padding: 0 },
        content: { overflow: "hidden" },
      }}
    >
      <Box p="lg">
        {isLoading ? (
          <LoadingState />
        ) : template ? (
          <Stack gap={0}>
            <ModalHeader template={template} onClose={handleCloseModal} />

            <Tabs value={activeTab} onChange={setActiveTab} className={styles.tabsContainer}>
              <Tabs.List>
                <Tabs.Tab value="exercises" leftSection={<IconLayoutList size={16} />}>
                  Exercises
                </Tabs.Tab>
                <Tabs.Tab value="add" leftSection={<IconPlus size={16} />}>
                  Add New
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="exercises" pt="md">
                <ExerciseListSection
                  exercises={template.exercises}
                  editingExerciseId={editingExerciseId}
                  templateId={templateId ?? 0}
                  onEdit={setEditingExerciseId}
                  onCancelEdit={() => setEditingExerciseId(null)}
                />
              </Tabs.Panel>

              <Tabs.Panel value="add" pt="md">
                {templateId && (
                  <AddExerciseInline
                    templateId={templateId}
                    excludeExerciseIds={excludeExerciseIds}
                  />
                )}
              </Tabs.Panel>
            </Tabs>
          </Stack>
        ) : (
          <EmptyTemplateState />
        )}
      </Box>
    </Modal>
  );
}

interface ExerciseListSectionProps {
  exercises: TemplateExercise[];
  editingExerciseId: number | null;
  templateId: number;
  onEdit: (id: number) => void;
  onCancelEdit: () => void;
}

function ExerciseListSection({
  exercises,
  editingExerciseId,
  templateId,
  onEdit,
  onCancelEdit,
}: ExerciseListSectionProps) {
  if (exercises.length === 0) {
    return <EmptyExerciseState />;
  }

  const editingExercise = exercises.find((e) => e.id === editingExerciseId);

  return (
    <Box className={styles.exerciseSection}>
      <Box className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>Workout Plan</Text>
        <Text className={styles.exerciseCount}>{exercises.length}</Text>
      </Box>

      {editingExercise && (
        <InlineEditForm
          exercise={editingExercise}
          templateId={templateId}
          onCancel={onCancelEdit}
          onSuccess={onCancelEdit}
        />
      )}

      <ScrollArea.Autosize className={styles.exerciseScrollArea}>
        <Stack gap="xs">
          {exercises.map((exercise, index) => (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              index={index}
              totalCount={exercises.length}
              isEditing={editingExerciseId === exercise.id}
              templateId={templateId}
              exercises={exercises}
              onEdit={() => onEdit(exercise.id)}
            />
          ))}
        </Stack>
      </ScrollArea.Autosize>
    </Box>
  );
}

function EmptyExerciseState() {
  return (
    <Box className={styles.emptyState}>
      <Box className={styles.emptyIcon}>
        <IconBarbell size={28} />
      </Box>
      <Text className={styles.emptyTitle}>No exercises yet</Text>
      <Text className={styles.emptyDescription}>
        Switch to the &quot;Add New&quot; tab to add exercises to this template.
      </Text>
    </Box>
  );
}

function EmptyTemplateState() {
  return (
    <Box className={styles.emptyState}>
      <Box className={styles.emptyIcon}>
        <IconTemplate size={28} />
      </Box>
      <Text className={styles.emptyTitle}>Template not found</Text>
      <Text className={styles.emptyDescription}>
        The template you&apos;re looking for doesn&apos;t exist or has been deleted.
      </Text>
    </Box>
  );
}

function LoadingState() {
  return (
    <Box className={styles.loadingState}>
      <Loader size="lg" />
      <Text className={styles.loadingText}>Loading template...</Text>
    </Box>
  );
}
