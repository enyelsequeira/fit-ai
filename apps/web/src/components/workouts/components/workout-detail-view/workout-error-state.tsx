import { Alert, Button, Container, Group, Stack, Text } from "@mantine/core";
import { IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

interface WorkoutErrorStateProps {
  errorMessage?: string;
}

export function WorkoutErrorState({ errorMessage }: WorkoutErrorStateProps) {
  return (
    <Container size="lg" py="xl">
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error Loading Workout"
        color="red"
        variant="light"
      >
        <Stack gap="md">
          <Text size="sm">
            {errorMessage ??
              "Unable to load workout details. The workout may not exist or you may not have access."}
          </Text>
          <Group>
            <Button
              component={Link}
              to="/dashboard/workouts"
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
            >
              Back to Workouts
            </Button>
          </Group>
        </Stack>
      </Alert>
    </Container>
  );
}
