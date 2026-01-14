import { createFileRoute } from "@tanstack/react-router";
import { MeasurementsView } from "@/components/measurements/measurements-view";

export const Route = createFileRoute("/dashboard/measurements/")({
  component: MeasurementsView,
});
