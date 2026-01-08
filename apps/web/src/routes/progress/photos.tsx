import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/functions/get-user";

import { PhotosTab } from "@/components/progress/photos-tab";

export const Route = createFileRoute("/progress/photos")({
  component: PhotosPage,
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

function PhotosPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Progress Photos</h1>
        <p className="text-sm text-muted-foreground">Track your transformation visually</p>
      </div>
      <PhotosTab />
    </div>
  );
}
