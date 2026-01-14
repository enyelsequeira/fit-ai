import { createFileRoute } from "@tanstack/react-router";
import { GoalsView } from "@/components/goals/goals-view";

export const Route = createFileRoute("/dashboard/goals/")({
  component: GoalsView,
});
