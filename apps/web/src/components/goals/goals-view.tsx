/**
 * GoalsView - Main goals page component
 * Displays goal summary, status tabs, and goal cards
 */

import { useCallback, useState } from "react";
import { Box, Button, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/state-views";
import { GoalsSummary } from "./goals-summary";
import { GoalsList } from "./goals-list";
import { CreateGoalModal } from "./create-goal-modal";
import { LogProgressModal } from "./log-progress-modal";
import { GoalDetailModal } from "./goal-detail-modal";
import { useGoalsData, useGoalDetail } from "./use-goals-data";
import { useGoalActions } from "./use-goal-actions";
import type { GoalWithExercise } from "./types";
import styles from "./goals-view.module.css";

export function GoalsView() {
  // Data hooks
  const {
    goals,
    stats,
    statusTabs,
    activeTab,
    setActiveTab,
    isLoading,
    isError,
    refetch,
    // Mutations
    completeMutation,
    pauseMutation,
    resumeMutation,
    abandonMutation,
    deleteMutation,
    updateProgressMutation,
    createWeightGoalMutation,
    createStrengthGoalMutation,
    createBodyMeasurementGoalMutation,
    createWorkoutFrequencyGoalMutation,
    createCustomGoalMutation,
  } = useGoalsData();

  // Modal states
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [logProgressModalOpened, { open: openLogProgressModal, close: closeLogProgressModal }] =
    useDisclosure(false);
  const [detailModalOpened, { open: openDetailModal, close: closeDetailModal }] =
    useDisclosure(false);

  // Selected goal for modals
  const [selectedGoal, setSelectedGoal] = useState<GoalWithExercise | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  // Fetch goal detail when opening detail modal
  const { goal: goalDetail, isLoading: isLoadingDetail } = useGoalDetail(selectedGoalId);

  // Consolidated action handlers from custom hook
  const {
    handleComplete,
    handlePause,
    handleResume,
    handleAbandon,
    handleDelete,
    handleLogProgressSubmit,
    handleCreateWeightGoal,
    handleCreateStrengthGoal,
    handleCreateBodyMeasurementGoal,
    handleCreateWorkoutFrequencyGoal,
    handleCreateCustomGoal,
    handleDetailLogProgress,
    handleDetailComplete,
    handleDetailPause,
    handleDetailResume,
    handleDetailAbandon,
    isCreating,
  } = useGoalActions({
    mutations: {
      completeMutation,
      pauseMutation,
      resumeMutation,
      abandonMutation,
      deleteMutation,
      updateProgressMutation,
      createWeightGoalMutation,
      createStrengthGoalMutation,
      createBodyMeasurementGoalMutation,
      createWorkoutFrequencyGoalMutation,
      createCustomGoalMutation,
    },
    closeCreateModal,
    closeLogProgressModal,
    closeDetailModal,
    openLogProgressModal,
    setSelectedGoal,
    goalDetail: goalDetail as GoalWithExercise | null,
  });

  // Navigation handlers
  const handleGoalClick = useCallback(
    (goal: GoalWithExercise) => {
      setSelectedGoalId(goal.id);
      openDetailModal();
    },
    [openDetailModal],
  );

  const handleLogProgress = useCallback(
    (goal: GoalWithExercise) => {
      setSelectedGoal(goal);
      openLogProgressModal();
    },
    [openLogProgressModal],
  );

  return (
    <Box p={{ base: "sm", md: "md" }} className={styles.goalsContainer}>
      <Stack gap="md">
        {/* Page header */}
        <PageHeader
          title="Goals & Progress"
          description="Set fitness goals and track your progress over time"
          actions={
            <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
              Create Goal
            </Button>
          }
        />

        {/* Stats overview */}
        <GoalsSummary stats={stats} />

        {/* Goals list with tabs */}
        <GoalsList
          goals={goals}
          statusTabs={statusTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          onGoalClick={handleGoalClick}
          onLogProgress={handleLogProgress}
          onComplete={handleComplete}
          onPause={handlePause}
          onResume={handleResume}
          onAbandon={handleAbandon}
          onDelete={handleDelete}
          onCreateGoal={openCreateModal}
        />
      </Stack>

      {/* Create Goal Modal */}
      <CreateGoalModal
        opened={createModalOpened}
        onClose={closeCreateModal}
        onCreateWeightGoal={handleCreateWeightGoal}
        onCreateStrengthGoal={handleCreateStrengthGoal}
        onCreateBodyMeasurementGoal={handleCreateBodyMeasurementGoal}
        onCreateWorkoutFrequencyGoal={handleCreateWorkoutFrequencyGoal}
        onCreateCustomGoal={handleCreateCustomGoal}
        isLoading={isCreating}
      />

      {/* Log Progress Modal */}
      <LogProgressModal
        opened={logProgressModalOpened}
        onClose={closeLogProgressModal}
        goal={selectedGoal}
        onSubmit={handleLogProgressSubmit}
        isLoading={updateProgressMutation.isPending}
      />

      {/* Goal Detail Modal */}
      <GoalDetailModal
        opened={detailModalOpened}
        onClose={closeDetailModal}
        goal={goalDetail ?? null}
        isLoading={isLoadingDetail}
        onLogProgress={handleDetailLogProgress}
        onComplete={handleDetailComplete}
        onPause={handleDetailPause}
        onResume={handleDetailResume}
        onAbandon={handleDetailAbandon}
      />
    </Box>
  );
}
