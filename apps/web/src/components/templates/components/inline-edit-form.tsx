/**
 * InlineEditForm - Form for editing exercise targets inline
 * Displays within the exercise list when editing
 */

import { useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Group,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconBarbell, IconClock, IconEdit, IconRepeat, IconWeight } from "@tabler/icons-react";
import { useUpdateExercise } from "../hooks/use-mutations";
import type { TemplateExercise } from "../types";
import styles from "./template-detail/template-detail-modal.module.css";

interface ExerciseUpdateData {
  targetSets?: number;
  targetReps?: string;
  targetWeight?: number;
  restSeconds?: number;
  notes?: string;
}

interface InlineEditFormProps {
  exercise: TemplateExercise;
  templateId: number;
  dayId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

export function InlineEditForm({
  exercise,
  templateId,
  dayId,
  onCancel,
  onSuccess,
}: InlineEditFormProps) {
  const [targetSets, setTargetSets] = useState<number | string>(exercise.targetSets ?? "");
  const [targetReps, setTargetReps] = useState(exercise.targetReps ?? "");
  const [targetWeight, setTargetWeight] = useState<number | string>(exercise.targetWeight ?? "");
  const [restSeconds, setRestSeconds] = useState<number | string>(exercise.restSeconds ?? "");
  const [notes, setNotes] = useState(exercise.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const updateExerciseMutation = useUpdateExercise(templateId, dayId);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const updates: ExerciseUpdateData = {
        targetSets: typeof targetSets === "number" ? targetSets : undefined,
        targetReps: targetReps.trim() || undefined,
        targetWeight: typeof targetWeight === "number" ? targetWeight : undefined,
        restSeconds: typeof restSeconds === "number" ? restSeconds : undefined,
        notes: notes.trim() || undefined,
      };

      await updateExerciseMutation.mutateAsync({
        templateId,
        exerciseId: exercise.id,
        notes: updates.notes,
        targetSets: updates.targetSets,
        targetReps: updates.targetReps,
        targetWeight: updates.targetWeight,
        restSeconds: updates.restSeconds,
      });
      onSuccess();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box className={styles.editForm}>
      <Box className={styles.editFormHeader}>
        <Box className={styles.editFormTitle}>
          <IconEdit size={16} />
          <Text component="span">Editing: {exercise.exercise?.name}</Text>
        </Box>
        <Tooltip label="Cancel editing" withArrow>
          <CloseButton size="sm" onClick={onCancel} />
        </Tooltip>
      </Box>

      <Stack gap="sm">
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          <NumberInput
            label="Sets"
            size="sm"
            value={targetSets}
            onChange={setTargetSets}
            min={1}
            max={20}
            leftSection={<IconRepeat size={14} />}
          />
          <TextInput
            label="Reps"
            size="sm"
            placeholder="e.g., 8-12"
            value={targetReps}
            onChange={(e) => setTargetReps(e.currentTarget.value)}
            leftSection={<IconBarbell size={14} />}
          />
          <NumberInput
            label="Weight (kg)"
            size="sm"
            value={targetWeight}
            onChange={setTargetWeight}
            min={0}
            leftSection={<IconWeight size={14} />}
          />
          <NumberInput
            label="Rest (sec)"
            size="sm"
            value={restSeconds}
            onChange={setRestSeconds}
            min={0}
            max={600}
            leftSection={<IconClock size={14} />}
          />
        </SimpleGrid>

        <Textarea
          label="Notes"
          size="sm"
          placeholder="Form cues, variations, tempo..."
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          minRows={2}
          autosize
        />

        <Group justify="flex-end" gap="xs">
          <Button variant="subtle" size="xs" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="xs" onClick={handleSubmit} loading={isSaving}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
