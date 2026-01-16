import { createFileRoute } from "@tanstack/react-router";
import { TemplatesView } from "@/components/templates/templates-view.tsx";

export const Route = createFileRoute("/dashboard/templates/")({
  component: TemplatesView,
});
