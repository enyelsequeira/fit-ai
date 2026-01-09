import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { IconArrowLeft, IconSettings } from "@tabler/icons-react";
import { toast } from "sonner";

import type { PreferencesData } from "@/components/ai/preferences-form";

import { PreferencesForm } from "@/components/ai/preferences-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/functions/get-user";
import { orpc, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/ai/preferences")({
  component: PreferencesPage,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
  },
});

function PreferencesPage() {
  // Fetch existing preferences
  const preferences = useQuery(orpc.ai.getPreferences.queryOptions());

  // Update preferences mutation
  const updatePreferences = useMutation(
    orpc.ai.updatePreferences.mutationOptions({
      onSuccess: () => {
        toast.success("Preferences saved!");
        queryClient.invalidateQueries({ queryKey: ["ai", "getPreferences"] });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to save preferences");
      },
    }),
  );

  const handleSubmit = (data: PreferencesData) => {
    updatePreferences.mutate({
      primaryGoal: data.primaryGoal,
      secondaryGoal: data.secondaryGoal,
      experienceLevel: data.experienceLevel,
      workoutDaysPerWeek: data.workoutDaysPerWeek,
      preferredWorkoutDuration: data.preferredWorkoutDuration,
      preferredDays: data.preferredDays,
      availableEquipment: data.availableEquipment,
      trainingLocation: data.trainingLocation,
      preferredExercises: data.preferredExercises,
      dislikedExercises: data.dislikedExercises,
      injuries: data.injuries,
      avoidMuscleGroups: data.avoidMuscleGroups,
      preferredSplit: data.preferredSplit,
    });
  };

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/ai">
          <Button variant="ghost" size="icon-sm">
            <IconArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <IconSettings className="size-5" />
            Training Preferences
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure your AI workout generation settings
          </p>
        </div>
      </div>

      {/* Form */}
      {preferences.isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <PreferencesForm
          initialData={preferences.data}
          onSubmit={handleSubmit}
          isLoading={updatePreferences.isPending}
        />
      )}
    </div>
  );
}
