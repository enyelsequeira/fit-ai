import type { ExerciseType } from "../exercise-form-validation";

import { Box, Text } from "@mantine/core";

import { MuscleGroupSelector } from "../muscle-group-selector";

interface MuscleGroupSectionProps {
  muscleGroups: string[];
  exerciseType: ExerciseType;
  onChange: (value: string[]) => void;
  error?: string;
}

export function MuscleGroupSection({
  muscleGroups,
  exerciseType,
  onChange,
  error,
}: MuscleGroupSectionProps) {
  const isRequired = exerciseType === "strength";

  return (
    <Box>
      <Text fz="sm" fw={500} mb={4}>
        Muscle Groups{" "}
        {isRequired && (
          <Text component="span" c="dimmed">
            *
          </Text>
        )}
      </Text>
      <MuscleGroupSelector value={muscleGroups} onChange={onChange} />
      {error && (
        <Text fz="xs" c="red" mt={4}>
          {error}
        </Text>
      )}
    </Box>
  );
}
