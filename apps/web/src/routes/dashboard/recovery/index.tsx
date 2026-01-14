import { createFileRoute } from "@tanstack/react-router";
import { RecoveryView } from "@/components/recovery/recovery-view";

export const Route = createFileRoute("/dashboard/recovery/")({
  component: RecoveryView,
});
