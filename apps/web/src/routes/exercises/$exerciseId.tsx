import type { ExerciseCategory } from "@/components/exercise";
import type { EquipmentType } from "@/components/exercise/equipment-icon";
import type {
  ExerciseForce,
  ExerciseLevel,
  ExerciseMechanic,
} from "@/components/exercise/exercise-level-badge";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { IconArrowLeft, IconLoader2, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  CategoryBadge,
  ExerciseEditButton,
  ExerciseForceBadge,
  ExerciseHistory,
  ExerciseImageGallery,
  ExerciseLevelBadge,
  ExerciseMechanicBadge,
  ExerciseStats,
  MuscleGroupTags,
} from "@/components/exercise";
import { EquipmentIcon, getEquipmentLabel } from "@/components/exercise/equipment-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/exercises/$exerciseId")({
  component: ExerciseDetailPage,
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

function ExerciseDetailPage() {
  const { exerciseId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const exerciseQuery = useQuery(
    orpc.exercise.getById.queryOptions({
      input: { id: Number(exerciseId) },
    }),
  );

  const deleteMutation = useMutation(
    orpc.exercise.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Exercise deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["exercise"] });
        navigate({ to: "/exercises" });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete exercise");
      },
    }),
  );

  if (exerciseQuery.isLoading) {
    return <ExerciseDetailSkeleton />;
  }

  if (!exerciseQuery.data) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Exercise not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate({ to: "/exercises" })}
            >
              Back to Exercises
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const exercise = exerciseQuery.data as {
    id: number;
    name: string;
    description: string | null;
    category: ExerciseCategory;
    muscleGroups: string[];
    equipment: EquipmentType;
    exerciseType: "strength" | "cardio" | "flexibility";
    isDefault: boolean;
    createdByUserId: string | null;
    // New fields
    primaryImage: string | null;
    images: string[];
    instructions: string[];
    level: ExerciseLevel | null;
    force: ExerciseForce | null;
    mechanic: ExerciseMechanic | null;
  };

  const canEdit = !exercise.isDefault;

  const handleDelete = () => {
    deleteMutation.mutate({ id: exercise.id });
  };

  return (
    <div className="container mx-auto space-y-6 p-4">
      {/* Back Button */}
      <Link
        to="/exercises"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <IconArrowLeft className="size-4" />
        Back to Exercises
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{exercise.name}</h1>
            {!exercise.isDefault && (
              <Badge variant="secondary" className="text-xs">
                Custom
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={exercise.category} />
            {exercise.level && <ExerciseLevelBadge level={exercise.level} />}
            <Badge variant="outline" className="capitalize">
              {exercise.exerciseType}
            </Badge>
            {exercise.equipment && (
              <Badge variant="outline" className="gap-1">
                <EquipmentIcon equipment={exercise.equipment} size="sm" />
                {getEquipmentLabel(exercise.equipment)}
              </Badge>
            )}
            {exercise.force && <ExerciseForceBadge force={exercise.force} />}
            {exercise.mechanic && <ExerciseMechanicBadge mechanic={exercise.mechanic} />}
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <ExerciseEditButton
              exerciseId={exercise.id}
              initialData={{
                name: exercise.name,
                description: exercise.description || "",
                category: exercise.category,
                exerciseType: exercise.exerciseType,
                muscleGroups: exercise.muscleGroups,
                equipment: exercise.equipment as NonNullable<EquipmentType> | null,
              }}
            />
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
              <IconTrash className="mr-1.5 size-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Image & Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Exercise Image Gallery */}
          <Card>
            <CardContent className="pt-4">
              <ExerciseImageGallery
                primaryImage={exercise.primaryImage}
                images={exercise.images}
                exerciseName={exercise.name}
              />
            </CardContent>
          </Card>

          {/* Muscle Groups */}
          {exercise.muscleGroups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Muscle Groups</CardTitle>
                <CardDescription>Muscles targeted by this exercise</CardDescription>
              </CardHeader>
              <CardContent>
                <MuscleGroupTags muscles={exercise.muscleGroups} maxVisible={10} />
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {exercise.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                  {exercise.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Instructions</CardTitle>
                <CardDescription>Step-by-step guide</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {exercise.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3 text-sm">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Stats & History */}
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="stats">
            <TabsList>
              <TabsTrigger value="stats">Personal Stats</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="stats">
              <ExerciseStats exerciseId={exercise.id} />
            </TabsContent>

            <TabsContent value="history">
              <ExerciseHistory exerciseId={exercise.id} limit={20} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exercise</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{exercise.name}&quot;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <IconLoader2 className="mr-2 size-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExerciseDetailSkeleton() {
  return (
    <div className="container mx-auto space-y-6 p-4">
      <Skeleton className="h-4 w-32" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          {/* Image skeleton */}
          <Card>
            <CardContent className="pt-4">
              <Skeleton className="h-64 w-full rounded-md" />
            </CardContent>
          </Card>

          {/* Muscle groups skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardContent>
          </Card>

          {/* Instructions skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-6 shrink-0 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-9 w-48" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
