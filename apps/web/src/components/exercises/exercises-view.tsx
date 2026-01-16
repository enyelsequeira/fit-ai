/**
 * ExercisesView - Main exercises library page component
 * Browse and search the exercise library with filters and pagination
 */

import { useCallback, useState } from "react";
import { Box, Button, Stack } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconDatabaseOff, IconPlus } from "@tabler/icons-react";

import { EmptyState, ErrorState, PageHeader } from "@/components/ui/state-views";

import { CreateExerciseModal } from "./create-exercise-modal";
import { ExerciseDetailModal } from "./exercise-detail-modal";
import { ExerciseFiltersDrawer } from "./exercise-filters-drawer";
import { ExerciseFiltersPanel } from "./exercise-filters-panel";
import { ExerciseSearchBar } from "./exercise-search-bar";
import { ExercisesGrid } from "./exercises-grid";
import { ExercisesList } from "./exercises-list";
import { ExercisesPagination } from "./exercises-pagination";
import { useExercisesData } from "./use-exercises-data";
import styles from "./exercises-view.module.css";

export function ExercisesView() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [filtersDrawerOpened, { open: openFiltersDrawer, close: closeFiltersDrawer }] =
    useDisclosure(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);

  const {
    exercises,
    total,
    equipmentList,
    muscleGroupsList,
    isLoading,
    isError,
    page,
    setPage,
    totalPages,
    pageSize,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    activeFiltersCount,
    searchQuery,
    setSearchQuery,
    clearSearch,
    viewMode,
    setViewMode,
    refetch,
  } = useExercisesData();

  const handleExerciseClick = useCallback((exerciseId: number) => {
    setSelectedExerciseId(exerciseId);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedExerciseId(null);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    closeCreateModal();
    refetch();
  }, [closeCreateModal, refetch]);

  // Error state
  if (isError) {
    return (
      <Box p={{ base: "sm", md: "md" }} className={styles.container}>
        <ErrorState
          title="Error loading exercises"
          message="Failed to load exercises. Please try again."
          onRetry={() => refetch()}
        />
      </Box>
    );
  }

  return (
    <Box p={{ base: "sm", md: "md" }} className={styles.container}>
      <Stack gap="md">
        {/* Page header */}
        <PageHeader
          title="Exercise Library"
          description={`Browse ${total.toLocaleString()} exercises, filter by muscle group, and create custom exercises`}
          actions={
            <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
              Create Exercise
            </Button>
          }
        />

        {/* Search and filters bar */}
        <ExerciseSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={clearSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          activeFiltersCount={activeFiltersCount}
          onOpenFilters={openFiltersDrawer}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          isMobile={isMobile ?? false}
        />

        {/* Main content area */}
        <Box className={styles.mainContent}>
          {/* Desktop sidebar filters */}
          {!isMobile && (
            <Box className={styles.sidebar}>
              <ExerciseFiltersPanel
                filters={filters}
                onFilterChange={updateFilter}
                onClearFilters={clearFilters}
                equipmentList={equipmentList}
                muscleGroupsList={muscleGroupsList}
                hasActiveFilters={hasActiveFilters}
              />
            </Box>
          )}

          {/* Content area */}
          <Box className={styles.content}>
            {/* Empty state */}
            {!isLoading && exercises.length === 0 && (
              <EmptyState
                icon={<IconDatabaseOff size={48} stroke={1.5} />}
                title="No exercises found"
                message={
                  hasActiveFilters || searchQuery
                    ? "Try adjusting your filters or search terms"
                    : "Start by creating your first custom exercise"
                }
                action={
                  (hasActiveFilters || searchQuery) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        clearFilters();
                        clearSearch();
                      }}
                    >
                      Clear all filters
                    </Button>
                  )
                }
              />
            )}

            {/* Exercise grid/list */}
            {viewMode === "grid" ? (
              <ExercisesGrid
                exercises={exercises}
                isLoading={isLoading}
                onExerciseClick={handleExerciseClick}
              />
            ) : (
              <ExercisesList
                exercises={exercises}
                isLoading={isLoading}
                onExerciseClick={handleExerciseClick}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <ExercisesPagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                total={total}
                pageSize={pageSize}
              />
            )}
          </Box>
        </Box>
      </Stack>

      {/* Mobile filters drawer */}
      <ExerciseFiltersDrawer
        opened={filtersDrawerOpened}
        onClose={closeFiltersDrawer}
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        equipmentList={equipmentList}
        muscleGroupsList={muscleGroupsList}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Exercise detail modal */}
      <ExerciseDetailModal exerciseId={selectedExerciseId} onClose={handleCloseDetail} />

      {/* Create exercise modal */}
      <CreateExerciseModal
        opened={createModalOpened}
        onClose={closeCreateModal}
        onSuccess={handleCreateSuccess}
      />
    </Box>
  );
}
