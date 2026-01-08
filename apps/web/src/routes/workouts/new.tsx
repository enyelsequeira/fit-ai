import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, Dumbbell, Loader2, Play, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { client, orpc } from "@/utils/orpc";

const searchSchema = z.object({
  from: z.enum(["template", "quick"]).optional(),
});

export const Route = createFileRoute("/workouts/new")({
  validateSearch: searchSchema,
  component: NewWorkoutRoute,
});

function NewWorkoutRoute() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = Route.useSearch();

  const templates = useQuery(
    orpc.template.list.queryOptions({
      input: { limit: 10 },
    }),
  );

  const createWorkoutMutation = useMutation({
    ...orpc.workout.create.mutationOptions(),
    onSuccess: (workout) => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout started!");
      navigate({ to: "/workouts/$workoutId", params: { workoutId: workout.id.toString() } });
    },
    onError: (error) => {
      toast.error("Failed to create workout", { description: error.message });
    },
  });

  const startFromTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return client.template.startWorkout({ id: templateId });
    },
    onSuccess: (workout) => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout started from template!");
      navigate({ to: "/workouts/$workoutId", params: { workoutId: workout.id.toString() } });
    },
    onError: (error) => {
      toast.error("Failed to start workout", { description: error.message });
    },
  });

  const handleStartEmpty = () => {
    createWorkoutMutation.mutate({});
  };

  const handleStartFromTemplate = (templateId: number) => {
    startFromTemplateMutation.mutate(templateId);
  };

  const isPending = createWorkoutMutation.isPending || startFromTemplateMutation.isPending;

  // Show template selection if `from=template`
  if (search.from === "template") {
    return (
      <div className="container mx-auto py-6 px-4 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/workouts/new"
            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Select Template</h1>
            <p className="text-sm text-muted-foreground">Choose a template to start your workout</p>
          </div>
        </div>

        {templates.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : templates.data?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Sparkles className="size-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No templates yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Create a template to quickly start workouts
              </p>
              <Link
                to="/workouts/new"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Start Empty Workout
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {templates.data?.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => !isPending && handleStartFromTemplate(template.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  {template.description && (
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {template.estimatedDurationMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {template.estimatedDurationMinutes} min
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Play className="size-3" />
                      Used {template.timesUsed} times
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/workouts" className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}>
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Start Workout</h1>
          <p className="text-sm text-muted-foreground">Choose how to start your workout</p>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Empty Workout */}
        <Card
          className="cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={!isPending ? handleStartEmpty : undefined}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center bg-primary/10 rounded-none">
                <Dumbbell className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm">Empty Workout</CardTitle>
                <CardDescription className="text-xs">
                  Start from scratch and add exercises as you go
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* From Template */}
        <Card
          className="cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() =>
            !isPending && navigate({ to: "/workouts/new", search: { from: "template" } })
          }
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center bg-purple-500/10 rounded-none">
                <Sparkles className="size-5 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-sm">From Template</CardTitle>
                <CardDescription className="text-xs">
                  Use a saved template to pre-populate exercises
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Start (Last Workout) */}
        <Card className="cursor-pointer hover:bg-muted/30 transition-colors opacity-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center bg-green-500/10 rounded-none">
                <Zap className="size-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-sm">Quick Start</CardTitle>
                <CardDescription className="text-xs">
                  Repeat your last workout (coming soon)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {isPending && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Creating workout...</p>
          </div>
        </div>
      )}
    </div>
  );
}
