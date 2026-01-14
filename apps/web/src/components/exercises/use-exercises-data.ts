/**
 * Custom hook for managing exercises data and state
 * Handles filtering, search, pagination, and data fetching
 */

import type { ExerciseCategory } from "@/components/exercise/category-badge";
import type { EquipmentType } from "@/components/exercise/equipment-icon";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@mantine/hooks";
import { orpc } from "@/utils/orpc";

export type ExerciseType = "strength" | "cardio" | "flexibility";
export type ViewMode = "grid" | "list";

export interface ExerciseFilters {
  category: ExerciseCategory | null;
  exerciseType: ExerciseType | null;
  muscleGroup: string | null;
  equipment: NonNullable<EquipmentType> | null;
  customOnly: boolean;
}

const DEFAULT_FILTERS: ExerciseFilters = {
  category: null,
  exerciseType: null,
  muscleGroup: null,
  equipment: null,
  customOnly: false,
};

const PAGE_SIZE = 24;

export function useExercisesData() {
  // State
  const [filters, setFilters] = useState<ExerciseFilters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);

  // Debounce search for performance
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);

  // Calculate offset for pagination
  const offset = (page - 1) * PAGE_SIZE;

  // Build query parameters
  const queryParams = useMemo(
    () => ({
      category: filters.category ?? undefined,
      exerciseType: filters.exerciseType ?? undefined,
      muscleGroup: filters.muscleGroup ?? undefined,
      equipment: filters.equipment ?? undefined,
      search: debouncedSearch || undefined,
      onlyUserExercises: filters.customOnly,
      limit: PAGE_SIZE,
      offset,
    }),
    [filters, debouncedSearch, offset],
  );

  // Fetch exercises
  const exercisesQuery = useQuery(
    orpc.exercise.list.queryOptions({ input: queryParams }),
  );

  // Fetch equipment list for filters
  const equipmentQuery = useQuery(orpc.exercise.getEquipmentList.queryOptions());

  // Fetch muscle groups for filters
  const muscleGroupsQuery = useQuery(orpc.exercise.getMuscleGroups.queryOptions());

  // Calculate total pages
  const totalPages = useMemo(() => {
    const total = exercisesQuery.data?.total ?? 0;
    return Math.ceil(total / PAGE_SIZE);
  }, [exercisesQuery.data?.total]);

  // Filter update handlers
  const updateFilter = useCallback(
    <K extends keyof ExerciseFilters>(key: K, value: ExerciseFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1); // Reset to first page when filters change
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page when search changes
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setPage(1);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.category !== null ||
      filters.exerciseType !== null ||
      filters.muscleGroup !== null ||
      filters.equipment !== null ||
      filters.customOnly
    );
  }, [filters]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return [
      filters.category,
      filters.exerciseType,
      filters.muscleGroup,
      filters.equipment,
      filters.customOnly,
    ].filter(Boolean).length;
  }, [filters]);

  return {
    // Data
    exercises: exercisesQuery.data?.exercises ?? [],
    total: exercisesQuery.data?.total ?? 0,
    equipmentList: equipmentQuery.data ?? [],
    muscleGroupsList: muscleGroupsQuery.data ?? [],

    // Loading states
    isLoading: exercisesQuery.isLoading,
    isError: exercisesQuery.isError,
    error: exercisesQuery.error,
    isEquipmentLoading: equipmentQuery.isLoading,
    isMuscleGroupsLoading: muscleGroupsQuery.isLoading,

    // Pagination
    page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,

    // Filters
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    activeFiltersCount,

    // Search
    searchQuery,
    setSearchQuery: handleSearch,
    clearSearch,
    debouncedSearch,

    // View mode
    viewMode,
    setViewMode,

    // Actions
    refetch: exercisesQuery.refetch,
  };
}

export type UseExercisesDataReturn = ReturnType<typeof useExercisesData>;
