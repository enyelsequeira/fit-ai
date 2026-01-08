import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/functions/get-user";

import { RecordsTab } from "@/components/progress/records-tab";

export const Route = createFileRoute("/progress/records")({
  component: RecordsPage,
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

function RecordsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Personal Records</h1>
        <p className="text-sm text-muted-foreground">View all your personal bests</p>
      </div>
      <RecordsTab />
    </div>
  );
}
