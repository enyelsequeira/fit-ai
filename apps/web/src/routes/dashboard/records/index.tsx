import { createFileRoute } from "@tanstack/react-router";
import { RecordsView } from "@/components/records/records-view";

export const Route = createFileRoute("/dashboard/records/")({
  component: RecordsView,
});
