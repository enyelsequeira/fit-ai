import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { IconArrowLeft, IconSettings, IconSparkles } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

import type { GeneratorOptions } from "@/components/ai/workout-generator-form";

import { GeneratedWorkoutResult } from "@/components/ai/generated-workout-result";
import { WorkoutGeneratorForm } from "@/components/ai/workout-generator-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getUser } from "@/functions/get-user";
import { orpc, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/ai/generate")({
  component: GenerateWorkoutPage,
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

function GenerateWorkoutPage() {
  const [generatedWorkout, setGeneratedWorkout] = useState<{
    id: number;
    generatedContent: {
      name: string;
      estimatedDuration: number;
      exercises: Array<{
        exerciseId: number;
        exerciseName: string;
        sets: number;
        reps: string;
        restSeconds: number;
        notes?: string;
        alternatives?: number[];
      }>;
      warmup?: string;
      cooldown?: string;
    } | null;
  } | null>(null);

  // Fetch preferences to check if set
  const preferences = useQuery(orpc.ai.getPreferences.queryOptions());

  // Generate workout mutation
  const generateWorkout = useMutation(
    orpc.ai.generateWorkout.mutationOptions({
      onSuccess: (data) => {
        setGeneratedWorkout(data);
        toast.success("Workout generated!");
        queryClient.invalidateQueries({ queryKey: ["ai", "getGeneratedHistory"] });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to generate workout");
      },
    }),
  );

  const hasPreferences = preferences.data !== null;

  const handleGenerate = (options: GeneratorOptions) => {
    generateWorkout.mutate({
      targetMuscleGroups: options.targetMuscleGroups,
      duration: options.duration,
      difficulty: options.difficulty,
      workoutType: options.workoutType,
    });
  };

  const handleRegenerate = () => {
    // Re-run with same options
    generateWorkout.mutate({});
  };

  const handleStartWorkout = () => {
    // TODO: Create workout from generated content and navigate
    toast.info("Starting workout feature coming soon!");
  };

  const handleSaveAsTemplate = () => {
    // TODO: Save as template
    toast.info("Save as template feature coming soon!");
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
            <IconSparkles className="size-5" />
            Generate Workout
          </h1>
          <p className="text-muted-foreground text-sm">AI-powered personalized workout creation</p>
        </div>
      </div>

      {/* No Preferences State */}
      {!preferences.isLoading && !hasPreferences && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="py-6">
            <EmptyState
              icon={IconSettings}
              title="Set up your training preferences first"
              description="Configure your goals, schedule, and equipment to get personalized AI workouts"
              action={
                <Link to="/ai/preferences">
                  <Button>Set Up Preferences</Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Generator Form */}
      {(preferences.isLoading || hasPreferences) && !generatedWorkout && (
        <WorkoutGeneratorForm
          onGenerate={handleGenerate}
          isLoading={generateWorkout.isPending}
          hasPreferences={hasPreferences}
        />
      )}

      {/* Generated Result */}
      {generatedWorkout && generatedWorkout.generatedContent && (
        <div className="space-y-4">
          <GeneratedWorkoutResult
            workout={generatedWorkout.generatedContent}
            onStart={handleStartWorkout}
            onRegenerate={handleRegenerate}
            onSaveAsTemplate={handleSaveAsTemplate}
            isRegenerating={generateWorkout.isPending}
          />

          <Button variant="outline" onClick={() => setGeneratedWorkout(null)} className="w-full">
            Generate Another Workout
          </Button>
        </div>
      )}
    </div>
  );
}
