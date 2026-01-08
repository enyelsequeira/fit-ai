import type { ExerciseCategory } from "./category-badge";
import type { EquipmentType } from "./equipment-icon";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { orpc } from "@/utils/orpc";

import { categoryConfig } from "./category-badge";
import { equipmentConfig } from "./equipment-icon";
import { MuscleGroupSelector } from "./muscle-group-selector";

export type ExerciseType = "strength" | "cardio" | "flexibility";

export interface ExerciseFormData {
  name: string;
  description: string;
  category: ExerciseCategory;
  exerciseType: ExerciseType;
  muscleGroups: string[];
  equipment: NonNullable<EquipmentType> | null;
}

const defaultFormData: ExerciseFormData = {
  name: "",
  description: "",
  category: "other",
  exerciseType: "strength",
  muscleGroups: [],
  equipment: null,
};

interface ExerciseFormDialogProps {
  initialData?: Partial<ExerciseFormData>;
  exerciseId?: number;
  onSuccess?: () => void;
}

export function ExerciseFormDialog({
  initialData,
  exerciseId,
  onSuccess,
}: ExerciseFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ExerciseFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ExerciseFormData, string>>>({});

  const queryClient = useQueryClient();
  const isEditing = exerciseId !== undefined;

  // Debounce the name for real-time duplicate checking
  const debouncedName = useDebounce(formData.name.trim(), 400);

  // Real-time name availability check
  const nameCheck = useQuery(
    orpc.exercise.checkNameAvailability.queryOptions({
      input: {
        name: debouncedName,
        excludeId: exerciseId,
      },
      enabled: debouncedName.length > 0 && open,
      staleTime: 10000, // Cache for 10 seconds
    }),
  );

  // Update name error when availability check returns
  useEffect(() => {
    if (nameCheck.data && !nameCheck.data.available && nameCheck.data.message) {
      setErrors((prev) => ({ ...prev, name: nameCheck.data.message }));
    } else if (nameCheck.data?.available && errors.name && !errors.name.includes("required")) {
      // Clear the duplicate error if name is now available
      setErrors((prev) => {
        const { name: _name, ...rest } = prev;
        return rest;
      });
    }
  }, [nameCheck.data, errors.name]);

  const createMutation = useMutation(
    orpc.exercise.create.mutationOptions({
      onSuccess: () => {
        toast.success("Exercise created successfully");
        queryClient.invalidateQueries({ queryKey: ["exercise"] });
        setOpen(false);
        setFormData(defaultFormData);
        onSuccess?.();
      },
      onError: (error) => {
        // Check if it's a duplicate name error (CONFLICT)
        if (error.message?.includes("already exists") || error.message?.includes("already have")) {
          setErrors((prev) => ({ ...prev, name: error.message }));
        } else {
          toast.error(error.message || "Failed to create exercise");
        }
      },
    }),
  );

  const updateMutation = useMutation(
    orpc.exercise.update.mutationOptions({
      onSuccess: () => {
        toast.success("Exercise updated successfully");
        queryClient.invalidateQueries({ queryKey: ["exercise"] });
        setOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        // Check if it's a duplicate name error (CONFLICT)
        if (error.message?.includes("already exists") || error.message?.includes("already have")) {
          setErrors((prev) => ({ ...prev, name: error.message }));
        } else {
          toast.error(error.message || "Failed to update exercise");
        }
      },
    }),
  );

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ExerciseFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (nameCheck.data && !nameCheck.data.available && nameCheck.data.message) {
      newErrors.name = nameCheck.data.message;
    }

    if (formData.exerciseType === "strength" && formData.muscleGroups.length === 0) {
      newErrors.muscleGroups = "At least one muscle group is required for strength exercises";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      exerciseType: formData.exerciseType,
      muscleGroups: formData.muscleGroups,
      equipment: formData.equipment || undefined,
    };

    if (isEditing && exerciseId) {
      updateMutation.mutate({ id: exerciseId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const categories = Object.entries(categoryConfig).map(([key, config]) => ({
    value: key as ExerciseCategory,
    label: config.label,
  }));

  const exerciseTypes: { value: ExerciseType; label: string }[] = [
    { value: "strength", label: "Strength" },
    { value: "cardio", label: "Cardio" },
    { value: "flexibility", label: "Flexibility" },
  ];

  const equipmentTypes = Object.entries(equipmentConfig).map(([key, config]) => ({
    value: key as NonNullable<EquipmentType>,
    label: config.label,
  }));

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 size-4" />
        {isEditing ? "Edit Exercise" : "Create Exercise"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Exercise" : "Create Custom Exercise"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the exercise details below."
                : "Add a new custom exercise to your library."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <div className="relative">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Incline Dumbbell Press"
                  aria-invalid={!!errors.name}
                  className="pr-8"
                />
                {debouncedName.length > 0 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {nameCheck.isFetching ? (
                      <Loader2 className="text-muted-foreground size-4 animate-spin" />
                    ) : nameCheck.data?.available ? (
                      <CheckCircle2 className="size-4 text-green-500" />
                    ) : nameCheck.data && !nameCheck.data.available ? (
                      <AlertCircle className="text-destructive size-4" />
                    ) : null}
                  </div>
                )}
              </div>
              {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the exercise, include any tips or instructions..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as ExerciseCategory })
                  }
                  className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full items-center rounded-none border bg-transparent px-2.5 py-1 text-xs transition-colors focus-visible:ring-1 outline-none"
                >
                  {categories.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exerciseType">Type *</Label>
                <select
                  id="exerciseType"
                  value={formData.exerciseType}
                  onChange={(e) =>
                    setFormData({ ...formData, exerciseType: e.target.value as ExerciseType })
                  }
                  className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full items-center rounded-none border bg-transparent px-2.5 py-1 text-xs transition-colors focus-visible:ring-1 outline-none"
                >
                  {exerciseTypes.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment">Equipment</Label>
              <select
                id="equipment"
                value={formData.equipment || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    equipment: e.target.value
                      ? (e.target.value as NonNullable<EquipmentType>)
                      : null,
                  })
                }
                className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full items-center rounded-none border bg-transparent px-2.5 py-1 text-xs transition-colors focus-visible:ring-1 outline-none"
              >
                <option value="">None / Bodyweight</option>
                {equipmentTypes.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>
                Muscle Groups{" "}
                {formData.exerciseType === "strength" && (
                  <span className="text-muted-foreground">*</span>
                )}
              </Label>
              <MuscleGroupSelector
                value={formData.muscleGroups}
                onChange={(muscleGroups) => setFormData({ ...formData, muscleGroups })}
              />
              {errors.muscleGroups && (
                <p className="text-destructive text-xs">{errors.muscleGroups}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEditing ? "Update" : "Create"} Exercise
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ExerciseEditButtonProps {
  exerciseId: number;
  initialData: Partial<ExerciseFormData>;
  onSuccess?: () => void;
}

export function ExerciseEditButton({
  exerciseId,
  initialData,
  onSuccess,
}: ExerciseEditButtonProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ExerciseFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ExerciseFormData, string>>>({});

  const queryClient = useQueryClient();

  // Debounce the name for real-time duplicate checking
  const debouncedName = useDebounce(formData.name.trim(), 400);

  // Real-time name availability check
  const nameCheck = useQuery(
    orpc.exercise.checkNameAvailability.queryOptions({
      input: {
        name: debouncedName,
        excludeId: exerciseId,
      },
      enabled: debouncedName.length > 0 && open,
      staleTime: 10000, // Cache for 10 seconds
    }),
  );

  // Update name error when availability check returns
  useEffect(() => {
    if (nameCheck.data && !nameCheck.data.available && nameCheck.data.message) {
      setErrors((prev) => ({ ...prev, name: nameCheck.data.message }));
    } else if (nameCheck.data?.available && errors.name && !errors.name.includes("required")) {
      // Clear the duplicate error if name is now available
      setErrors((prev) => {
        const { name: _name, ...rest } = prev;
        return rest;
      });
    }
  }, [nameCheck.data, errors.name]);

  const updateMutation = useMutation(
    orpc.exercise.update.mutationOptions({
      onSuccess: () => {
        toast.success("Exercise updated successfully");
        queryClient.invalidateQueries({ queryKey: ["exercise"] });
        setOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        // Check if it's a duplicate name error (CONFLICT)
        if (error.message?.includes("already exists") || error.message?.includes("already have")) {
          setErrors((prev) => ({ ...prev, name: error.message }));
        } else {
          toast.error(error.message || "Failed to update exercise");
        }
      },
    }),
  );

  const isLoading = updateMutation.isPending;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ExerciseFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (nameCheck.data && !nameCheck.data.available && nameCheck.data.message) {
      newErrors.name = nameCheck.data.message;
    }

    if (formData.exerciseType === "strength" && formData.muscleGroups.length === 0) {
      newErrors.muscleGroups = "At least one muscle group is required for strength exercises";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    updateMutation.mutate({
      id: exerciseId,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      exerciseType: formData.exerciseType,
      muscleGroups: formData.muscleGroups,
      equipment: formData.equipment || undefined,
    });
  };

  const categories = Object.entries(categoryConfig).map(([key, config]) => ({
    value: key as ExerciseCategory,
    label: config.label,
  }));

  const exerciseTypes: { value: ExerciseType; label: string }[] = [
    { value: "strength", label: "Strength" },
    { value: "cardio", label: "Cardio" },
    { value: "flexibility", label: "Flexibility" },
  ];

  const equipmentTypes = Object.entries(equipmentConfig).map(([key, config]) => ({
    value: key as NonNullable<EquipmentType>,
    label: config.label,
  }));

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
            <DialogDescription>Update the exercise details below.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <div className="relative">
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Incline Dumbbell Press"
                  aria-invalid={!!errors.name}
                  className="pr-8"
                />
                {debouncedName.length > 0 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {nameCheck.isFetching ? (
                      <Loader2 className="text-muted-foreground size-4 animate-spin" />
                    ) : nameCheck.data?.available ? (
                      <CheckCircle2 className="size-4 text-green-500" />
                    ) : nameCheck.data && !nameCheck.data.available ? (
                      <AlertCircle className="text-destructive size-4" />
                    ) : null}
                  </div>
                )}
              </div>
              {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the exercise..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <select
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as ExerciseCategory })
                  }
                  className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full items-center rounded-none border bg-transparent px-2.5 py-1 text-xs transition-colors focus-visible:ring-1 outline-none"
                >
                  {categories.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-exerciseType">Type *</Label>
                <select
                  id="edit-exerciseType"
                  value={formData.exerciseType}
                  onChange={(e) =>
                    setFormData({ ...formData, exerciseType: e.target.value as ExerciseType })
                  }
                  className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full items-center rounded-none border bg-transparent px-2.5 py-1 text-xs transition-colors focus-visible:ring-1 outline-none"
                >
                  {exerciseTypes.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-equipment">Equipment</Label>
              <select
                id="edit-equipment"
                value={formData.equipment || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    equipment: e.target.value
                      ? (e.target.value as NonNullable<EquipmentType>)
                      : null,
                  })
                }
                className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full items-center rounded-none border bg-transparent px-2.5 py-1 text-xs transition-colors focus-visible:ring-1 outline-none"
              >
                <option value="">None / Bodyweight</option>
                {equipmentTypes.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>
                Muscle Groups{" "}
                {formData.exerciseType === "strength" && (
                  <span className="text-muted-foreground">*</span>
                )}
              </Label>
              <MuscleGroupSelector
                value={formData.muscleGroups}
                onChange={(muscleGroups) => setFormData({ ...formData, muscleGroups })}
              />
              {errors.muscleGroups && (
                <p className="text-destructive text-xs">{errors.muscleGroups}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Update Exercise
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
