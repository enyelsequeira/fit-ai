import { useState } from "react";
import { Box, Button, ScrollArea, Stack, Text } from "@mantine/core";
import { IconBarbell, IconBed, IconPlus } from "@tabler/icons-react";
import type { TemplateDay, TemplateExercise } from "../../types.ts";
import { AddExerciseInline } from "../add-exercise-inline/add-exercise-inline.tsx";
import { ExerciseItem } from "../exercise-item.tsx";
import { InlineEditForm } from "../inline-edit-form.tsx";
import styles from "./template-detail-modal.module.css";

// ============================================================================
// Rest Day Content Component
// ============================================================================

interface RestDayContentProps {
  day: TemplateDay;
}

export function RestDayContent({ day }: RestDayContentProps) {
  return (
    <Box className={styles.restDayContent}>
      <Box className={styles.restDayIcon}>
        <IconBed size={32} />
      </Box>
      <Text size="lg" fw={600} c="dimmed">
        Rest Day
      </Text>
      <Text size="sm" c="dimmed">
        {day.description || "Take time to recover and prepare for the next workout."}
      </Text>
    </Box>
  );
}

// ============================================================================
// Day Exercise Content Component
// ============================================================================

interface DayExerciseContentProps {
  day: TemplateDay;
  templateId: number;
  editingExerciseId: number | null;
  setEditingExerciseId: (id: number | null) => void;
  excludeExerciseIds: number[];
}

export function DayExerciseContent({
  day,
  templateId,
  editingExerciseId,
  setEditingExerciseId,
  excludeExerciseIds,
}: DayExerciseContentProps) {
  const [showAddExercise, setShowAddExercise] = useState(false);
  const exercises = day.exercises ?? [];

  return (
    <ScrollArea.Autosize mah={450} type="auto" offsetScrollbars>
      <Stack gap="md">
        {exercises.length > 0 ? (
          <ExerciseListSection
            exercises={exercises}
            editingExerciseId={editingExerciseId}
            templateId={templateId}
            dayId={day.id}
            onEdit={setEditingExerciseId}
            onCancelEdit={() => setEditingExerciseId(null)}
          />
        ) : (
          <EmptyExerciseState />
        )}

        {showAddExercise ? (
          <Box>
            <AddExerciseInline
              templateId={templateId}
              dayId={day.id}
              excludeExerciseIds={excludeExerciseIds}
              onClose={() => setShowAddExercise(false)}
            />
          </Box>
        ) : (
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => setShowAddExercise(true)}
            fullWidth
          >
            Add Exercise
          </Button>
        )}
      </Stack>
    </ScrollArea.Autosize>
  );
}

// ============================================================================
// Exercise List Section
// ============================================================================

interface ExerciseListSectionProps {
  exercises: TemplateExercise[];
  editingExerciseId: number | null;
  templateId: number;
  dayId: number;
  onEdit: (id: number) => void;
  onCancelEdit: () => void;
}

function ExerciseListSection({
  exercises,
  editingExerciseId,
  templateId,
  dayId,
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
          dayId={dayId}
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
              dayId={dayId}
              exercises={exercises}
              onEdit={() => onEdit(exercise.id)}
            />
          ))}
        </Stack>
      </ScrollArea.Autosize>
    </Box>
  );
}

// ============================================================================
// Empty Exercise State
// ============================================================================

function EmptyExerciseState() {
  return (
    <Box className={styles.emptyState}>
      <Box className={styles.emptyIcon}>
        <IconBarbell size={28} />
      </Box>
      <Text className={styles.emptyTitle}>No exercises yet</Text>
      <Text className={styles.emptyDescription}>Add exercises to build your workout routine.</Text>
    </Box>
  );
}
