/**
 * TemplateExerciseList - Displays list of exercises in a template with reordering and editing
 */

import { useCallback, useState } from "react";
import { ScrollArea, Stack, Text } from "@mantine/core";
import type { TemplateExercise } from "../types";
import { TemplateExerciseItem } from "./template-exercise-item";
import { EditExerciseForm, type ExerciseUpdateData } from "./edit-exercise-form";
import styles from "./template-detail-modal.module.css";

interface TemplateExerciseListProps {
  exercises: TemplateExercise[];
  onUpdateExercise: (exerciseId: number, data: ExerciseUpdateData) => Promise<unknown>;
  onRemoveExercise: (exerciseId: number) => Promise<unknown>;
  onReorderExercises: (exerciseIds: number[]) => Promise<unknown>;
}

export function TemplateExerciseList({
  exercises,
  onUpdateExercise,
  onRemoveExercise,
  onReorderExercises,
}: TemplateExerciseListProps) {
  const [editingExercise, setEditingExercise] = useState<TemplateExercise | null>(null);

  const handleMoveExercise = useCallback(
    async (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= exercises.length) return;

      const items = Array.from(exercises);
      const movedItem = items[fromIndex];
      if (movedItem) {
        items.splice(fromIndex, 1);
        items.splice(toIndex, 0, movedItem);
      }

      const exerciseIds = items.map((item) => item.id);
      await onReorderExercises(exerciseIds);
    },
    [exercises, onReorderExercises],
  );

  const handleSaveExercise = useCallback(
    async (data: ExerciseUpdateData) => {
      if (!editingExercise) return;
      await onUpdateExercise(editingExercise.id, data);
      setEditingExercise(null);
    },
    [editingExercise, onUpdateExercise],
  );

  const handleRemove = useCallback(
    async (exerciseId: number) => {
      await onRemoveExercise(exerciseId);
    },
    [onRemoveExercise],
  );

  if (exercises?.length === 0) {
    return (
      <Stack align="center" justify="center" p="xl" className={styles.emptyExercises}>
        <Text c="dimmed" ta="center">
          No exercises in this template yet. Use the form below to add exercises.
        </Text>
      </Stack>
    );
  }

  return (
    <>
      {editingExercise && (
        <EditExerciseForm
          exercise={editingExercise}
          onSave={handleSaveExercise}
          onCancel={() => setEditingExercise(null)}
        />
      )}

      <ScrollArea.Autosize mah={400}>
        <Stack gap="xs">
          {exercises.map((exercise, index) => (
            <TemplateExerciseItem
              key={exercise.id}
              exercise={exercise}
              index={index}
              totalCount={exercises.length}
              onEdit={setEditingExercise}
              onRemove={handleRemove}
              onMoveUp={() => handleMoveExercise(index, index - 1)}
              onMoveDown={() => handleMoveExercise(index, index + 1)}
            />
          ))}
        </Stack>
      </ScrollArea.Autosize>
    </>
  );
}
