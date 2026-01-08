import type { ExerciseCategory, ExerciseFilters, ViewMode } from "@/components/exercise";
import type { EquipmentType } from "@/components/exercise/equipment-icon";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Dumbbell, Search } from "lucide-react";
import { useEffect, useState } from "react";
import z from "zod";

import {
  CategoryTabs,
  ExerciseFiltersBar,
  ExerciseFormDialog,
  ExerciseGrid,
  ExerciseGridSkeleton,
  ExerciseList,
  ExerciseListSkeleton,
  ExerciseSearch,
} from "@/components/exercise";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getUser } from "@/functions/get-user";
import { useDebounce } from "@/hooks/use-debounce";
import { orpc } from "@/utils/orpc";

const PAGE_SIZE = 24;

const searchSchema = z.object({
  page: z.coerce.number().min(1).default(1).catch(1),
  search: z.string().optional().catch(undefined),
  category: z
    .enum([
      "chest",
      "back",
      "shoulders",
      "arms",
      "legs",
      "core",
      "cardio",
      "flexibility",
      "compound",
      "other",
    ])
    .optional()
    .catch(undefined),
  exerciseType: z.enum(["strength", "cardio", "flexibility"]).optional().catch(undefined),
  equipment: z.string().optional().catch(undefined),
  customOnly: z.enum(["true", "false"]).optional().catch(undefined),
  view: z.enum(["grid", "list"]).default("grid").catch("grid"),
});

type SearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/exercises/")({
  component: ExercisesPage,
  validateSearch: searchSchema,
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

function ExercisesPage() {
  const navigate = useNavigate({ from: "/exercises" });
  const searchParams = Route.useSearch();

  // Convert string-based customOnly to boolean for internal use
  const isCustomOnly = searchParams.customOnly === "true";

  // Local search state for immediate UI updates
  const [localSearch, setLocalSearch] = useState(searchParams.search ?? "");
  const debouncedQuery = useDebounce(localSearch, 300);

  // Helper to update search params while preserving existing values
  const updateSearchParams = (updates: Partial<SearchParams>) => {
    void navigate({
      search: {
        page: updates.page ?? searchParams.page,
        search: "search" in updates ? updates.search : searchParams.search,
        category: "category" in updates ? updates.category : searchParams.category,
        exerciseType: "exerciseType" in updates ? updates.exerciseType : searchParams.exerciseType,
        equipment: "equipment" in updates ? updates.equipment : searchParams.equipment,
        customOnly: "customOnly" in updates ? updates.customOnly : searchParams.customOnly,
        view: updates.view ?? searchParams.view,
      },
      replace: true,
    });
  };

  // Sync local search with URL on debounced value change
  useEffect(() => {
    const currentSearch = searchParams.search ?? "";
    if (debouncedQuery !== currentSearch) {
      updateSearchParams({ search: debouncedQuery || undefined, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Calculate offset from page
  const offset = (searchParams.page - 1) * PAGE_SIZE;

  // Use the list endpoint with filters
  const exercises = useQuery(
    orpc.exercise.list.queryOptions({
      input: {
        search: searchParams.search || undefined,
        category: searchParams.category || undefined,
        exerciseType: searchParams.exerciseType || undefined,
        equipment: searchParams.equipment || undefined,
        onlyUserExercises: isCustomOnly || undefined,
        limit: PAGE_SIZE,
        offset,
      },
    }),
  );

  // Calculate pagination info
  const total = exercises.data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = searchParams.page;

  // Cast exercises to the correct type
  const typedExercises = exercises.data?.exercises as
    | Array<{
        id: number;
        name: string;
        description: string | null;
        category: ExerciseCategory;
        muscleGroups: string[];
        equipment: EquipmentType;
        exerciseType: "strength" | "cardio" | "flexibility";
        isDefault: boolean;
        createdByUserId: string | null;
      }>
    | undefined;

  // Build filters object from search params
  const filters: ExerciseFilters = {
    category: searchParams.category ?? null,
    exerciseType: searchParams.exerciseType ?? null,
    equipment: (searchParams.equipment as EquipmentType) ?? null,
    customOnly: isCustomOnly,
  };

  const handleFiltersChange = (newFilters: ExerciseFilters) => {
    updateSearchParams({
      category: newFilters.category ?? undefined,
      exerciseType: newFilters.exerciseType ?? undefined,
      equipment: newFilters.equipment ?? undefined,
      customOnly: newFilters.customOnly ? "true" : undefined,
      page: 1,
    });
  };

  const handleCategoryChange = (category: ExerciseCategory | null) => {
    updateSearchParams({ category: category ?? undefined, page: 1 });
  };

  const handleViewModeChange = (view: ViewMode) => {
    updateSearchParams({ view });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Calculate range of exercises being shown
  const startIndex = offset + 1;
  const endIndex = Math.min(offset + PAGE_SIZE, total);

  return (
    <div className="container mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exercise Library</h1>
          <p className="text-muted-foreground text-sm">
            Browse exercises or create your own custom exercises
          </p>
        </div>
        <ExerciseFormDialog />
      </div>

      {/* Search */}
      <ExerciseSearch value={localSearch} onChange={setLocalSearch} className="max-w-md" />

      {/* Category Tabs */}
      <CategoryTabs selectedCategory={filters.category} onCategoryChange={handleCategoryChange} />

      {/* Filters and View Toggle */}
      <ExerciseFiltersBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        viewMode={searchParams.view}
        onViewModeChange={handleViewModeChange}
      />

      {/* Exercise List/Grid */}
      {exercises.isLoading ? (
        searchParams.view === "grid" ? (
          <ExerciseGridSkeleton count={8} />
        ) : (
          <ExerciseListSkeleton count={5} />
        )
      ) : !typedExercises || typedExercises.length === 0 ? (
        <EmptyState
          icon={searchParams.search ? Search : Dumbbell}
          title={
            searchParams.search
              ? "No exercises found"
              : isCustomOnly
                ? "No custom exercises yet"
                : "No exercises available"
          }
          description={
            searchParams.search
              ? "Try adjusting your search or filters"
              : isCustomOnly
                ? "Create your first custom exercise to get started"
                : "Exercises will appear here"
          }
          action={isCustomOnly ? <ExerciseFormDialog /> : undefined}
        />
      ) : searchParams.view === "grid" ? (
        <ExerciseGrid exercises={typedExercises} />
      ) : (
        <ExerciseList exercises={typedExercises} />
      )}

      {/* Results count and pagination */}
      {typedExercises && typedExercises.length > 0 && (
        <div className="flex flex-col items-center gap-4 pt-4">
          <p className="text-muted-foreground text-sm">
            Showing {startIndex}-{endIndex} of {total} exercise{total !== 1 ? "s" : ""}
          </p>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) =>
                  page === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationButton
                        isActive={page === currentPage}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </PaginationButton>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
