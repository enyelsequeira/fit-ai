/**
 * EditExerciseForm - Inline form for editing exercise targets (sets, reps, weight, rest)
 */

import { useState } from "react";
import { Box, Button, Group, NumberInput, Stack, Text, Textarea, TextInput } from "@mantine/core";
import type { TemplateExercise } from "../types";
import styles from "./template-detail-modal.module.css";

export interface ExerciseUpdateData {
  targetSets?: number;
  targetReps?: string;
  targetWeight?: number;
  restSeconds?: number;
  notes?: string;
}

interface EditExerciseFormProps {
  exercise: TemplateExercise;
  onSave: (data: ExerciseUpdateData) => Promise<void>;
  onCancel: () => void;
}

export function EditExerciseForm({ exercise, onSave, onCancel }: EditExerciseFormProps) {
  const [targetSets, setTargetSets] = useState<number | string>(exercise.targetSets ?? "");
  const [targetReps, setTargetReps] = useState(exercise.targetReps ?? "");
  const [targetWeight, setTargetWeight] = useState<number | string>(exercise.targetWeight ?? "");
  const [restSeconds, setRestSeconds] = useState<number | string>(exercise.restSeconds ?? "");
  const [notes, setNotes] = useState(exercise.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave({
        targetSets: typeof targetSets === "number" ? targetSets : undefined,
        targetReps: targetReps.trim() || undefined,
        targetWeight: typeof targetWeight === "number" ? targetWeight : undefined,
        restSeconds: typeof restSeconds === "number" ? restSeconds : undefined,
        notes: notes.trim() || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box p="md" mb="sm" className={styles.editForm}>
      <Group justify="space-between" mb="sm">
        <Text size="sm" fw={500}>
          Edit: {exercise.exercise?.name}
        </Text>
        <Button variant="subtle" size="xs" onClick={onCancel}>
          Cancel
        </Button>
      </Group>

      <Stack gap="sm">
        <Group grow>
          <NumberInput
            label="Sets"
            size="sm"
            value={targetSets}
            onChange={setTargetSets}
            min={1}
            max={20}
          />
          <TextInput
            label="Reps"
            size="sm"
            placeholder="e.g., 8-12"
            value={targetReps}
            onChange={(e) => setTargetReps(e.currentTarget.value)}
          />
        </Group>
        <Group grow>
          <NumberInput
            label="Weight (kg)"
            size="sm"
            value={targetWeight}
            onChange={setTargetWeight}
            min={0}
          />
          <NumberInput
            label="Rest (sec)"
            size="sm"
            value={restSeconds}
            onChange={setRestSeconds}
            min={0}
            max={600}
          />
        </Group>
        <Textarea
          label="Notes (optional)"
          size="sm"
          placeholder="Form cues, variations, etc."
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          minRows={2}
        />
        <Group justify="flex-end" gap="xs">
          <Button variant="subtle" size="xs" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="xs" onClick={handleSubmit} loading={isSaving}>
            Save
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
