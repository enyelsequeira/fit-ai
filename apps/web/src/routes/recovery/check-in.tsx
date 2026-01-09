import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, useSearch } from "@tanstack/react-router";
import { IconArrowLeft, IconCalendarPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import z from "zod";

import type { CheckInData } from "@/components/recovery/check-in-form";

import { CheckInForm } from "@/components/recovery/check-in-form";
import { CheckInSummary } from "@/components/recovery/check-in-summary";
import { ReadinessScore } from "@/components/ai/readiness-score";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/functions/get-user";
import { orpc, queryClient } from "@/utils/orpc";

const searchSchema = z.object({
  date: z.string().optional(),
});

export const Route = createFileRoute("/recovery/check-in")({
  component: CheckInPage,
  validateSearch: searchSchema,
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

function CheckInPage() {
  const { date } = useSearch({ from: "/recovery/check-in" });

  // Today's date string
  const today = new Date().toISOString().split("T")[0] ?? "";
  const targetDate = date ?? today;
  const isToday = targetDate === today;

  // Fetch today's or specific date check-in
  const checkIn = useQuery(
    date
      ? orpc.recovery.getCheckInByDate.queryOptions({ input: { date } })
      : orpc.recovery.getTodayCheckIn.queryOptions(),
  );

  // Fetch readiness after check-in submission
  const readiness = useQuery(orpc.recovery.getReadiness.queryOptions());

  // Create/update check-in mutation
  const createCheckIn = useMutation(
    orpc.recovery.createCheckIn.mutationOptions({
      onSuccess: () => {
        toast.success("Check-in saved!");
        queryClient.invalidateQueries({ queryKey: ["recovery"] });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to save check-in");
      },
    }),
  );

  // Delete check-in mutation
  const deleteCheckIn = useMutation(
    orpc.recovery.deleteCheckIn.mutationOptions({
      onSuccess: () => {
        toast.success("Check-in deleted!");
        queryClient.invalidateQueries({ queryKey: ["recovery"] });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete check-in");
      },
    }),
  );

  const handleSubmit = (data: CheckInData) => {
    createCheckIn.mutate({
      date: targetDate,
      sleepHours: data.sleepHours,
      sleepQuality: data.sleepQuality,
      energyLevel: data.energyLevel,
      stressLevel: data.stressLevel,
      sorenessLevel: data.sorenessLevel,
      soreAreas: data.soreAreas as
        | (
            | "chest"
            | "back"
            | "shoulders"
            | "biceps"
            | "triceps"
            | "forearms"
            | "abs"
            | "quadriceps"
            | "hamstrings"
            | "glutes"
            | "calves"
          )[]
        | undefined,
      restingHeartRate: data.restingHeartRate,
      hrvScore: data.hrvScore,
      motivationLevel: data.motivationLevel,
      mood: data.mood,
      nutritionQuality: data.nutritionQuality,
      hydrationLevel: data.hydrationLevel,
      notes: data.notes,
    });
  };

  const handleEdit = () => {
    // Simply refetch to get fresh data
    checkIn.refetch();
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this check-in?")) {
      deleteCheckIn.mutate({ date: targetDate });
    }
  };

  const hasCheckIn = checkIn.data !== null && checkIn.data !== undefined;

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/recovery">
          <Button variant="ghost" size="icon-sm">
            <IconArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <IconCalendarPlus className="size-5" />
            {isToday
              ? "Today's Check-in"
              : `Check-in for ${new Date(targetDate).toLocaleDateString()}`}
          </h1>
          <p className="text-muted-foreground text-sm">
            {hasCheckIn ? "Update your daily wellness data" : "Log your daily wellness data"}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {checkIn.isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : hasCheckIn && !createCheckIn.isSuccess ? (
        // Show Summary with Edit Option
        <div className="space-y-6">
          <CheckInSummary
            checkIn={checkIn.data as NonNullable<typeof checkIn.data>}
            onEdit={handleEdit}
          />

          {/* Readiness Score After Check-in */}
          {readiness.data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Your Training Readiness</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-4">
                <ReadinessScore
                  score={readiness.data.score}
                  size="md"
                  recommendation={
                    readiness.data.recommendation === "ready to train hard"
                      ? "Ready for hard training!"
                      : readiness.data.recommendation === "light training recommended"
                        ? "Light training recommended"
                        : "Rest day suggested"
                  }
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => queryClient.setQueryData(["recovery", "getTodayCheckIn"], null)}
              className="flex-1"
            >
              Edit Check-in
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteCheckIn.isPending}>
              Delete
            </Button>
          </div>
        </div>
      ) : (
        // Show Form
        <div className="space-y-6">
          <CheckInForm
            initialData={checkIn.data}
            onSubmit={handleSubmit}
            isLoading={createCheckIn.isPending}
          />

          {/* Show Readiness after successful submission */}
          {createCheckIn.isSuccess && readiness.data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Your Training Readiness</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-4">
                <ReadinessScore
                  score={readiness.data.score}
                  size="md"
                  recommendation={
                    readiness.data.recommendation === "ready to train hard"
                      ? "Ready for hard training!"
                      : readiness.data.recommendation === "light training recommended"
                        ? "Light training recommended"
                        : "Rest day suggested"
                  }
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
