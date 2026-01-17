import { createFileRoute } from "@tanstack/react-router";
import { WorkoutsView } from "@/components/workouts/workouts-view.tsx";

export const Route = createFileRoute("/dashboard/workouts/")({
  component: WorkoutsView,
});
