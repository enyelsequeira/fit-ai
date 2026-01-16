/**
 * RecoveryView - Main recovery page component
 * Split layout with readiness/check-in on left, trends/history on right
 * Responsive: stacks vertically on mobile
 */

import { useCallback, useState } from "react";
import { ActionIcon, Box, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconRefresh } from "@tabler/icons-react";
import { ErrorState, PageHeader } from "@/components/ui/state-views";
import { ReadinessScoreCard } from "./readiness-score-card";
import { CheckInSummary } from "./check-in-summary";
import { CheckInForm, type CheckInData } from "./check-in-form";
import { MuscleRecoveryMap } from "./muscle-recovery-map";
import { RecoveryTrendsChart } from "./recovery-trends-chart";
import { CheckInHistory } from "./check-in-history";
import { useRecoveryData } from "./use-recovery-data";
import styles from "./recovery-view.module.css";

export function RecoveryView() {
  const {
    // Today's check-in
    todayCheckIn,
    hasTodayCheckIn,
    isTodayCheckInLoading,

    // Readiness
    readiness,
    isReadinessLoading,

    // Recovery status
    recoveryStatus,
    isRecoveryStatusLoading,

    // Trends
    trends,
    trendPeriod,
    setTrendPeriod,
    isTrendsLoading,

    // History
    checkInHistory,
    hasMoreHistory,
    loadMoreHistory,
    isHistoryLoading,

    // Mutations
    submitCheckIn,
    isSubmitting,
    refreshRecovery,
    isRefreshing,

    // General state
    isError,
    refetch,
  } = useRecoveryData();

  // Modal state for check-in form
  const [checkInModalOpened, { open: openCheckInModal, close: closeCheckInModal }] =
    useDisclosure(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Handlers
  const handleStartCheckIn = useCallback(() => {
    setIsEditMode(false);
    openCheckInModal();
  }, [openCheckInModal]);

  const handleEditCheckIn = useCallback(() => {
    setIsEditMode(true);
    openCheckInModal();
  }, [openCheckInModal]);

  const handleSubmitCheckIn = useCallback(
    async (data: CheckInData) => {
      await submitCheckIn(data);
      closeCheckInModal();
    },
    [submitCheckIn, closeCheckInModal],
  );

  const handleRefreshRecovery = useCallback(async () => {
    await refreshRecovery();
  }, [refreshRecovery]);

  // Error state
  if (isError) {
    return (
      <Box p={{ base: "sm", md: "md" }} className={styles.recoveryContainer}>
        <ErrorState
          title="Error loading recovery data"
          message="Failed to load recovery data. Please try again."
          onRetry={refetch}
        />
      </Box>
    );
  }

  return (
    <Box p={{ base: "sm", md: "md" }} className={styles.recoveryContainer}>
      <Stack gap="md">
        {/* Page header */}
        <PageHeader
          title="Recovery & Check-ins"
          description="Track your daily wellness and monitor muscle recovery"
          actions={
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={handleRefreshRecovery}
              loading={isRefreshing}
              title="Refresh recovery data"
            >
              <IconRefresh size={20} />
            </ActionIcon>
          }
        />

        {/* Main content: Left + Right columns */}
        <Box className={styles.mainContent}>
          {/* Left column: Readiness + Check-in + Muscle Recovery */}
          <Box className={styles.leftColumn}>
            {/* Readiness Score */}
            <ReadinessScoreCard readiness={readiness} isLoading={isReadinessLoading} />

            {/* Today's Check-in Summary */}
            <CheckInSummary
              checkIn={todayCheckIn}
              isLoading={isTodayCheckInLoading}
              onEdit={handleEditCheckIn}
              onCreateNew={handleStartCheckIn}
            />

            {/* Muscle Recovery Map */}
            <MuscleRecoveryMap
              muscleGroups={recoveryStatus?.muscleGroups ?? []}
              overallRecovery={recoveryStatus?.overallRecovery}
              isLoading={isRecoveryStatusLoading}
            />
          </Box>

          {/* Right column: Trends + History */}
          <Box className={styles.rightColumn}>
            {/* Recovery Trends */}
            <RecoveryTrendsChart
              trends={trends}
              period={trendPeriod}
              onPeriodChange={setTrendPeriod}
              isLoading={isTrendsLoading}
            />

            {/* Check-in History */}
            <CheckInHistory
              checkIns={checkInHistory}
              hasMore={hasMoreHistory}
              isLoading={isHistoryLoading}
              onLoadMore={loadMoreHistory}
            />
          </Box>
        </Box>
      </Stack>

      {/* Check-in Form Modal */}
      <Modal
        opened={checkInModalOpened}
        onClose={closeCheckInModal}
        title={isEditMode ? "Edit Today's Check-in" : "Daily Check-in"}
        size="lg"
        centered
      >
        <CheckInForm
          initialData={isEditMode ? todayCheckIn : null}
          onSubmit={handleSubmitCheckIn}
          isLoading={isSubmitting}
        />
      </Modal>
    </Box>
  );
}
