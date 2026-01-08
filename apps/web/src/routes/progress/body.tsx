import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/functions/get-user";

import { BodyTab } from "@/components/progress/body-tab";

export const Route = createFileRoute("/progress/body")({
  component: BodyPage,
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

function BodyPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Body Measurements</h1>
        <p className="text-sm text-muted-foreground">Track your weight and body measurements</p>
      </div>
      <BodyTab />
    </div>
  );
}
