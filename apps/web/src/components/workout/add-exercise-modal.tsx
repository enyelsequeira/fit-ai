import type { Exercise } from "./exercise-search";

import { Box, Modal, Text } from "@mantine/core";

import { ExerciseSearch } from "./exercise-search";

interface AddExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exercise: Exercise) => void;
  selectedExerciseIds?: number[];
}

function AddExerciseModal({
  open,
  onOpenChange,
  onSelectExercise,
  selectedExerciseIds = [],
}: AddExerciseModalProps) {
  const handleSelect = (exercise: Exercise) => {
    onSelectExercise(exercise);
    onOpenChange(false);
  };

  return (
    <Modal
      opened={open}
      onClose={() => onOpenChange(false)}
      title="Add Exercise"
      size="lg"
      styles={{
        content: {
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        },
        body: {
          flex: 1,
          overflow: "hidden",
        },
      }}
    >
      <Text fz="sm" c="dimmed" mb="md">
        Search and select an exercise to add to your workout
      </Text>
      <Box style={{ flex: 1, overflow: "hidden" }}>
        <ExerciseSearch onSelect={handleSelect} selectedExerciseIds={selectedExerciseIds} />
      </Box>
    </Modal>
  );
}

export { AddExerciseModal };
