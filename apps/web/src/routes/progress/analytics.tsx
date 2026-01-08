import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/functions/get-user";

import { AnalyticsTab } from "@/components/progress/analytics-tab";

export const Route = createFileRoute("/progress/analytics")({
  component: AnalyticsPage,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function AnalyticsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Deep dive into your training data</p>
      </div>
      <AnalyticsTab />
    </div>
  );
}
