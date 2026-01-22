import { Stack } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";
import { FocusedWorkoutView } from "@/components/workouts/components/focused-workout/focused-workout-view.tsx";

export const Route = createFileRoute("/dashboard/workouts/$workout-id")({
  component: WorkoutDetailPage,
});

function WorkoutDetailPage() {
  const { "workout-id": workoutIdParam } = Route.useParams();
  const navigate = useNavigate();
  const workoutId = Number(workoutIdParam);

  // Handle invalid workout ID
  if (Number.isNaN(workoutId)) {
    return (
      <Stack align="center" justify="center" p="xl" gap="md">
        <FitAiText.Heading>Invalid Workout</FitAiText.Heading>
        <FitAiText.Muted>The workout ID provided is not valid.</FitAiText.Muted>
        <FitAiButton variant="ghost" onClick={() => navigate({ to: "/dashboard/workouts" })}>
          Go Back
        </FitAiButton>
      </Stack>
    );
  }

  return <FocusedWorkoutView workoutId={workoutId} />;
}
