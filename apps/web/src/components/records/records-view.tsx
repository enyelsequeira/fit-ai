/**
 * RecordsView - Main personal records page component
 * Displays summary stats, recent PRs, and all-time bests with filtering
 */

import { useCallback, useEffect } from "react";
import { Box, Center, Loader, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ErrorState, PageHeader } from "@/components/ui/state-views";
import { useRecordsData } from "./use-records-data";
import { PRSummary } from "./pr-summary";
import { RecentPRsList } from "./recent-prs-list";
import { AllTimePRsGrid } from "./all-time-prs-grid";
import { RecordsFilters } from "./records-filters";
import { PRDetailModal } from "./pr-detail-modal";
import styles from "./records-view.module.css";

export function RecordsView() {
  const {
    records,
    recentRecords,
    recordsByExercise,
    stats,
    recordTypeFilter,
    setRecordTypeFilter,
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    hasActiveFilters,
    selectedRecordId,
    setSelectedRecordId,
    isLoading,
    isError,
    refetch,
  } = useRecordsData();

  // Modal state management using useDisclosure
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  // Sync modal state with selected record
  useEffect(() => {
    if (selectedRecordId !== null && !modalOpened) {
      openModal();
    }
  }, [selectedRecordId, modalOpened, openModal]);

  // Handle opening the detail modal
  const handleRecordClick = useCallback(
    (recordId: number) => {
      setSelectedRecordId(recordId);
      openModal();
    },
    [setSelectedRecordId, openModal],
  );

  // Handle closing the detail modal
  const handleCloseModal = useCallback(() => {
    closeModal();
    setSelectedRecordId(null);
  }, [closeModal, setSelectedRecordId]);

  // Handle exercise click (show first record for that exercise)
  const handleExerciseClick = useCallback(
    (exerciseId: number) => {
      const exerciseGroup = recordsByExercise.find((g) => g.exerciseId === exerciseId);
      if (exerciseGroup && exerciseGroup.records.length > 0) {
        const firstRecord = exerciseGroup.records[0];
        if (firstRecord) {
          handleRecordClick(firstRecord.id);
        }
      }
    },
    [recordsByExercise, handleRecordClick],
  );

  // Filter records by exercise based on debounced search
  const filteredRecordsByExercise = debouncedSearchQuery.trim()
    ? recordsByExercise.filter((g) =>
        g.exerciseName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
      )
    : recordsByExercise;

  // Error state
  if (isError) {
    return (
      <Box p={{ base: "sm", md: "md" }} className={styles.recordsContainer}>
        <Stack gap="md">
          <PageHeader title="Personal Records" />
          <ErrorState
            title="Error loading records"
            message="Failed to load your personal records. Please try again."
            onRetry={refetch}
          />
        </Stack>
      </Box>
    );
  }

  // Initial loading state
  if (isLoading && records.length === 0) {
    return (
      <Box p={{ base: "sm", md: "md" }} className={styles.recordsContainer}>
        <Stack gap="md">
          <PageHeader
            title="Personal Records"
            description="Track your personal bests and celebrate your achievements"
          />
          <Center py="xl">
            <Stack align="center" gap="sm">
              <Loader size="lg" />
              <Text size="sm" c="dimmed">
                Loading your records...
              </Text>
            </Stack>
          </Center>
        </Stack>
      </Box>
    );
  }

  return (
    <Box p={{ base: "sm", md: "md" }} className={styles.recordsContainer}>
      <Stack gap="md">
        {/* Page header */}
        <PageHeader
          title="Personal Records"
          description="Track your personal bests and celebrate your achievements"
        />

        {/* Summary stats */}
        <PRSummary stats={stats} />

        {/* Filters */}
        <RecordsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          recordTypeFilter={recordTypeFilter}
          onRecordTypeChange={setRecordTypeFilter}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Main content: Recent PRs + All-Time Grid */}
        <Box className={styles.mainContent}>
          {/* Left column: Recent PRs */}
          <Box className={styles.leftColumn}>
            <RecentPRsList
              records={recentRecords}
              isLoading={isLoading}
              onRecordClick={handleRecordClick}
            />
          </Box>

          {/* Right column: All-time bests grid */}
          <Box className={styles.rightColumn}>
            <AllTimePRsGrid
              recordsByExercise={filteredRecordsByExercise}
              isLoading={isLoading}
              onExerciseClick={handleExerciseClick}
              onRecordClick={handleRecordClick}
            />
          </Box>
        </Box>
      </Stack>

      {/* Detail Modal */}
      <PRDetailModal recordId={selectedRecordId} opened={modalOpened} onClose={handleCloseModal} />
    </Box>
  );
}
