import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  IconBrain,
  IconCalendarPlus,
  IconClipboardList,
  IconSparkles,
  IconSettings,
  IconBolt,
} from "@tabler/icons-react";
import { toast } from "@/components/ui/sonner";

import { FactorsBreakdown, ReadinessScore } from "@/components/ai/readiness-score";
import { RecommendationCard } from "@/components/ai/recommendation-card";
import { GeneratedWorkoutCard } from "@/components/ai/generated-workout-card";
import { FitAiButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/functions/get-user";
import { orpc, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/ai/")({
  component: AIHubPage,
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

function AIHubPage() {
  // Fetch readiness score
  const readiness = useQuery(orpc.recovery.getReadiness.queryOptions());

  // Fetch AI recommendations
  const recommendations = useQuery(orpc.ai.getRecommendations.queryOptions());

  // Fetch generated workout history
  const generatedHistory = useQuery(
    orpc.ai.getGeneratedHistory.queryOptions({ input: { limit: 5, offset: 0 } }),
  );

  // Fetch preferences to check if set
  const preferences = useQuery(orpc.ai.getPreferences.queryOptions());

  // Submit feedback mutation
  const submitFeedback = useMutation(
    orpc.ai.submitFeedback.mutationOptions({
      onSuccess: () => {
        toast.success("Feedback submitted!");
        queryClient.invalidateQueries({ queryKey: ["ai", "getGeneratedHistory"] });
      },
    }),
  );

  const hasPreferences = preferences.data !== null;

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <IconBrain className="size-5" />
            AI Hub
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your personalized AI training assistant
          </p>
        </div>
        <Link to="/ai/preferences">
          <FitAiButton variant="outline" size="sm" className="gap-1.5">
            <IconSettings className="size-3.5" />
            Preferences
          </FitAiButton>
        </Link>
      </div>

      {/* Readiness Score Hero */}
      <Card>
        <CardContent className="py-8">
          {readiness.isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="size-32 rounded-full" />
              <Skeleton className="h-6 w-48" />
            </div>
          ) : readiness.data ? (
            <div className="flex flex-col items-center gap-6">
              <ReadinessScore
                score={readiness.data.score}
                size="lg"
                recommendation={
                  readiness.data.recommendation === "ready to train hard"
                    ? "Ready for hard training!"
                    : readiness.data.recommendation === "light training recommended"
                      ? "Light training recommended"
                      : "Rest day suggested"
                }
              />
              <FactorsBreakdown factors={readiness.data.factors} className="w-full max-w-md" />
              {!readiness.data.todayCheckIn && (
                <Link to="/recovery/check-in">
                  <FitAiButton variant="outline" size="sm" className="gap-1.5">
                    <IconCalendarPlus className="size-3.5" />
                    Log Today's Check-in
                  </FitAiButton>
                </Link>
              )}
            </div>
          ) : (
            <EmptyState
              icon={IconBolt}
              title="No readiness data"
              description="Log a daily check-in to see your training readiness"
              action={
                <Link to="/recovery/check-in">
                  <FitAiButton size="sm">Log Check-in</FitAiButton>
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/ai/generate" className="block">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <IconSparkles className="size-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Generate Workout</p>
                <p className="text-muted-foreground text-xs">AI-powered workout creation</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/recovery/check-in" className="block">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
                <IconCalendarPlus className="size-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Daily Check-in</p>
                <p className="text-muted-foreground text-xs">Track your recovery</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/recovery" className="block">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <IconClipboardList className="size-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Recovery Status</p>
                <p className="text-muted-foreground text-xs">View muscle recovery</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* No Preferences Warning */}
      {!preferences.isLoading && !hasPreferences && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <IconSettings className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Set up your training preferences</p>
              <p className="text-muted-foreground text-xs">
                Configure your goals, schedule, and equipment to get personalized AI workouts
              </p>
            </div>
            <Link to="/ai/preferences">
              <FitAiButton size="sm">Set Up</FitAiButton>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.data && recommendations.data.recommendations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium">AI Recommendations</h2>
          <div className="grid gap-2">
            {recommendations.data.recommendations.map((rec, idx) => (
              <RecommendationCard key={idx} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Generated Workout History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Recent AI Workouts</h2>
          {generatedHistory.data && generatedHistory.data.total > 5 && (
            <span className="text-xs text-muted-foreground">
              Showing 5 of {generatedHistory.data.total}
            </span>
          )}
        </div>

        {generatedHistory.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : generatedHistory.data && generatedHistory.data.workouts.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {generatedHistory.data.workouts.map((workout) => (
              <GeneratedWorkoutCard
                key={workout.id}
                workout={workout}
                onRate={(rating) => {
                  submitFeedback.mutate({
                    generatedWorkoutId: workout.id,
                    rating,
                  });
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={IconSparkles}
            title="No generated workouts yet"
            description="Generate your first AI-powered workout"
            action={
              <Link to="/ai/generate">
                <FitAiButton size="sm">Generate Workout</FitAiButton>
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
