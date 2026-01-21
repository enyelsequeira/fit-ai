import { Box, Button, Center, Stack, Text } from "@mantine/core";
import { IconBarbell, IconPlus } from "@tabler/icons-react";

type EmptyExercisesStateProps = {
  isCompleted: boolean;
  onAddExercise: () => void;
};

export function EmptyExercisesState({ isCompleted, onAddExercise }: EmptyExercisesStateProps) {
  return (
    <Box py="xl">
      <Center>
        <Stack align="center" gap="md">
          <IconBarbell size={48} style={{ opacity: 0.3 }} />
          <Text c="dimmed" ta="center">
            No exercises added yet.
            {!isCompleted && " Click the button above to add exercises."}
          </Text>
          {!isCompleted && (
            <Button leftSection={<IconPlus size={16} />} onClick={onAddExercise}>
              Add Your First Exercise
            </Button>
          )}
        </Stack>
      </Center>
    </Box>
  );
}
