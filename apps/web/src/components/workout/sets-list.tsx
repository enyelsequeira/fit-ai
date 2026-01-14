import { IconPlus } from "@tabler/icons-react";

import { Box, Button, Stack, Text } from "@mantine/core";

import type { ExerciseSet, PreviousPerformance } from "./exercise-block.types";
import { SetRow } from "./set-row";

interface SetsListProps {
  sets: ExerciseSet[];
  previousPerformance?: PreviousPerformance | null;
  weightUnit: "kg" | "lb";
  onUpdateSet: (setId: number | string, data: Partial<ExerciseSet>) => void;
  onDeleteSet: (setId: number | string) => void;
  onCompleteSet: (setId: number | string) => void;
  onAddSet: () => void;
}

function SetsListHeader({ weightUnit }: { weightUnit: "kg" | "lb" }) {
  return (
    <Box
      px={4}
      pb="xs"
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr 1fr auto auto",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Text fz="xs" c="dimmed" fw={500} style={{ minWidth: 60 }}>
        Set
      </Text>
      <Text fz="xs" c="dimmed" fw={500} ta="center" style={{ minWidth: 70 }}>
        Previous
      </Text>
      <Text fz="xs" c="dimmed" fw={500} ta="center">
        {weightUnit.toUpperCase()}
      </Text>
      <Text fz="xs" c="dimmed" fw={500} ta="center">
        Reps
      </Text>
      <Box style={{ minWidth: 100 }} />
    </Box>
  );
}

function SetsList({
  sets,
  previousPerformance,
  weightUnit,
  onUpdateSet,
  onDeleteSet,
  onCompleteSet,
  onAddSet,
}: SetsListProps) {
  return (
    <>
      <SetsListHeader weightUnit={weightUnit} />

      <Stack gap={0}>
        {sets.map((set) => {
          const prevSet = previousPerformance?.sets.find((s) => s.setNumber === set.setNumber);
          return (
            <SetRow
              key={set.id}
              setNumber={set.setNumber}
              weight={set.weight}
              reps={set.reps}
              rpe={set.rpe}
              setType={set.setType}
              isCompleted={set.isCompleted ?? false}
              previousWeight={prevSet?.weight ?? set.targetWeight}
              previousReps={prevSet?.reps ?? set.targetReps}
              weightUnit={weightUnit}
              onWeightChange={(value) => onUpdateSet(set.id, { weight: value })}
              onRepsChange={(value) => onUpdateSet(set.id, { reps: value })}
              onRpeChange={(value) => onUpdateSet(set.id, { rpe: value })}
              onSetTypeChange={(value) => onUpdateSet(set.id, { setType: value })}
              onComplete={() => onCompleteSet(set.id)}
              onDelete={() => onDeleteSet(set.id)}
            />
          );
        })}
      </Stack>

      <Button
        variant="subtle"
        size="sm"
        fullWidth
        mt="xs"
        c="dimmed"
        onClick={onAddSet}
        leftSection={<IconPlus style={{ width: 16, height: 16 }} />}
      >
        Add Set
      </Button>
    </>
  );
}

export { SetsList };
