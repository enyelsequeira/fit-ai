import { Button, Group, Text } from "@mantine/core";
import { IconBarbell, IconPlus } from "@tabler/icons-react";

type ExercisesSectionHeaderProps = {
  isCompleted: boolean;
  onAddExercise: () => void;
};

export function ExercisesSectionHeader({
  isCompleted,
  onAddExercise,
}: ExercisesSectionHeaderProps) {
  return (
    <Group justify="space-between" align="center">
      <Group gap="xs">
        <IconBarbell size={20} />
        <Text fw={600} size="lg">
          Exercises
        </Text>
      </Group>
      {!isCompleted && (
        <Button leftSection={<IconPlus size={16} />} variant="light" onClick={onAddExercise}>
          Add Exercise
        </Button>
      )}
    </Group>
  );
}
