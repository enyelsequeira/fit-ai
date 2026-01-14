import { createFileRoute } from "@tanstack/react-router";
import { ExercisesView } from "@/components/exercises/exercises-view";

export const Route = createFileRoute("/dashboard/exercises/")({
  component: ExercisesView,
});
