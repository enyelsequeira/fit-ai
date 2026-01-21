/**
 * Workout Detail Page Route
 * Shows full workout details with exercises, sets, and completion controls
 */

import { createFileRoute } from "@tanstack/react-router";
import { FocusedWorkoutView } from "@/components/workouts/components/focused-workout/focused-workout-view.tsx";

export const Route = createFileRoute("/dashboard/workouts/$workout-id")({
  component: WorkoutDetailPage,
});

function WorkoutDetailPage() {
  const { "workout-id": workoutIdParam } = Route.useParams();
  const workoutId = Number(workoutIdParam);

  // Handle invalid workout ID
  if (Number.isNaN(workoutId)) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Invalid Workout</h2>
        <p>The workout ID provided is not valid.</p>
      </div>
    );
  }

  return <FocusedWorkoutView workoutId={workoutId} />;
}
