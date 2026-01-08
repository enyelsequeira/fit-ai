import { useQuery } from "@tanstack/react-query";
import { Dumbbell, Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

type ExerciseCategory =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "cardio"
  | "compound"
  | "flexibility"
  | "other";

const EXERCISE_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "legs", label: "Legs" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
  { value: "compound", label: "Compound" },
] as const;

interface Exercise {
  id: number;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment: string | null;
  exerciseType: string;
}

interface ExerciseSearchProps {
  onSelect: (exercise: Exercise) => void;
  selectedExerciseIds?: number[];
  className?: string;
}

function ExerciseSearch({ onSelect, selectedExerciseIds = [], className }: ExerciseSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const exercises = useQuery(
    orpc.exercise.list.queryOptions({
      input: {
        search: searchQuery || undefined,
        category: selectedCategory !== "all" ? (selectedCategory as ExerciseCategory) : undefined,
        limit: 50,
        offset: 0,
      },
    }),
  );

  const filteredExercises = useMemo(() => {
    if (!exercises.data?.exercises) return [];
    return exercises.data.exercises.filter((ex) => !selectedExerciseIds.includes(ex.id));
  }, [exercises.data, selectedExerciseIds]);

  const groupedExercises = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    for (const exercise of filteredExercises) {
      const category = exercise.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(exercise);
    }
    return groups;
  }, [filteredExercises]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-1.5">
        {EXERCISE_CATEGORIES.map((category) => (
          <button
            key={category.value}
            type="button"
            onClick={() => setSelectedCategory(category.value)}
            className={cn(
              "px-2.5 py-1 text-xs rounded-none border transition-colors",
              selectedCategory === category.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:bg-muted",
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto max-h-[400px] -mx-2">
        {exercises.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Dumbbell className="size-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No exercises found</p>
            {searchQuery && (
              <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
            )}
          </div>
        ) : selectedCategory === "all" ? (
          // Grouped view
          <div className="space-y-4">
            {Object.entries(groupedExercises).map(([category, categoryExercises]) => (
              <div key={category}>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                  {category}
                </h4>
                <div className="space-y-0.5">
                  {categoryExercises.map((exercise) => (
                    <ExerciseItem
                      key={exercise.id}
                      exercise={exercise}
                      onClick={() => onSelect(exercise)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Flat view
          <div className="space-y-0.5">
            {filteredExercises.map((exercise) => (
              <ExerciseItem
                key={exercise.id}
                exercise={exercise}
                onClick={() => onSelect(exercise)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ExerciseItemProps {
  exercise: Exercise;
  onClick: () => void;
  isSelected?: boolean;
}

function ExerciseItem({ exercise, onClick, isSelected }: ExerciseItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-2 py-2.5 text-left rounded-none transition-colors",
        "hover:bg-muted focus:bg-muted focus:outline-none",
        isSelected && "bg-primary/10",
      )}
    >
      <div className="flex-shrink-0 size-8 bg-muted rounded-none flex items-center justify-center">
        <Dumbbell className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{exercise.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {exercise.equipment && <span>{exercise.equipment}</span>}
          {exercise.muscleGroups.length > 0 && (
            <>
              {exercise.equipment && <span>•</span>}
              <span className="truncate">{exercise.muscleGroups.slice(0, 2).join(", ")}</span>
            </>
          )}
        </div>
      </div>
      <Badge variant="secondary" className="text-xs capitalize">
        {exercise.exerciseType}
      </Badge>
    </button>
  );
}

export { ExerciseSearch };
export type { Exercise };
