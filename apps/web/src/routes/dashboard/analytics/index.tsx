import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsView } from "@/components/analytics/analytics-view.tsx";

export const Route = createFileRoute("/dashboard/analytics/")({
  component: AnalyticsView,
});
