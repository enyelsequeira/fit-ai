/**
 * GoalsView - Main goals page component
 * Displays goal summary, status tabs, and goal cards
 * Uses sidebar + header + content area pattern matching workouts/templates
 */

import type { GoalStatus, GoalWithExercise, GoalsFilter } from "./types";

import { useCallback, useMemo, useState } from "react";
import { Box, Container, Flex, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconTarget } from "@tabler/icons-react";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import { FitAiContentArea } from "@/components/ui/fit-ai-content-area/fit-ai-content-area";
import { FitAiPageHeader } from "@/components/ui/fit-ai-page-header/fit-ai-page-header";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import { CreateGoalModal } from "./create-goal-modal";
import { GoalDetailModal } from "./goal-detail-modal";
import { GoalsList } from "./goals-list";
import { GoalsSummary } from "./goals-summary";
import styles from "./goals-view.module.css";
import { LogProgressModal } from "./log-progress-modal";
import { useGoalById, useGoalsList, useGoalsStats, useStatusTabs } from "./queries/use-queries";
import { useGoalActions } from "./use-goal-actions";

export function GoalsView() {
  // Tab and filter state
  const [activeTab, setActiveTab] = useState<GoalStatus | "all">("all");
  const [filters] = useState<GoalsFilter>({});
  const queryFilters = useMemo(
    () => ({ ...filters, ...(activeTab !== "all" ? { status: activeTab } : {}) }),
    [filters, activeTab],
  );

  // Data queries
  const goalsQuery = useGoalsList(queryFilters);
  const stats = useGoalsStats();
  const statusTabs = useStatusTabs();

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
  const goalDetailQuery = useGoalById(selectedGoalId);
  const goalDetail = goalDetailQuery.data;
  const isLoadingDetail = goalDetailQuery.isLoading;

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
    isUpdatingProgress,
  } = useGoalActions({
    closeCreateModal,
    closeLogProgressModal,
    closeDetailModal,
    openLogProgressModal,
    setSelectedGoal,
    goalDetail: goalDetail as GoalWithExercise | null,
  });

  const handleCloseDetailModal = useCallback(() => {
    closeDetailModal();
    setSelectedGoalId(null);
  }, [closeDetailModal]);

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
    <>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Group gap="xs" align="center">
            <Flex
              align="center"
              justify="center"
              w={36}
              h={36}
              c="white"
              className={styles.logoIcon}
              style={{ borderRadius: "var(--mantine-radius-md)" }}
            >
              <IconTarget size={20} />
            </Flex>
            <FitAiText variant="subheading">Goals</FitAiText>
          </Group>
        </div>

        <div className={styles.sidebarContent}>
          {/* Goal type filter or status navigation can go here later */}
        </div>

        <Box p="md" className={styles.sidebarFooter}>
          <FitAiButton
            variant="primary"
            fullWidth
            leftSection={<IconPlus size={16} />}
            onClick={openCreateModal}
            className={styles.createButton}
          >
            New Goal
          </FitAiButton>
        </Box>
      </div>

      {/* Main Content */}
      <Container fluid flex={1}>
        <FitAiPageHeader>
          <FitAiPageHeader.Title>Goals &amp; Progress</FitAiPageHeader.Title>
          <FitAiPageHeader.Description>
            Set fitness goals and track your progress over time
          </FitAiPageHeader.Description>
          <FitAiPageHeader.Actions>
            <FitAiPageHeader.Action
              variant="primary"
              icon={<IconPlus size={16} />}
              onClick={openCreateModal}
            >
              Create Goal
            </FitAiPageHeader.Action>
          </FitAiPageHeader.Actions>
          <FitAiPageHeader.Stats>
            <GoalsSummary stats={stats} />
          </FitAiPageHeader.Stats>
        </FitAiPageHeader>

        <FitAiContentArea>
          <GoalsList
            goals={goalsQuery.data ?? []}
            tabs={{
              statusTabs,
              activeTab,
              onTabChange: setActiveTab,
            }}
            loadingState={{
              isLoading: goalsQuery.isLoading,
              isError: goalsQuery.isError,
              onRetry: goalsQuery.refetch,
            }}
            actions={{
              onGoalClick: handleGoalClick,
              onLogProgress: handleLogProgress,
              onComplete: handleComplete,
              onPause: handlePause,
              onResume: handleResume,
              onAbandon: handleAbandon,
              onDelete: handleDelete,
              onCreateGoal: openCreateModal,
            }}
          />
        </FitAiContentArea>
      </Container>

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
        isLoading={isUpdatingProgress}
      />

      {/* Goal Detail Modal */}
      <GoalDetailModal
        opened={detailModalOpened}
        onClose={handleCloseDetailModal}
        goal={goalDetail ?? null}
        isLoading={isLoadingDetail}
        onLogProgress={handleDetailLogProgress}
        onComplete={handleDetailComplete}
        onPause={handleDetailPause}
        onResume={handleDetailResume}
        onAbandon={handleDetailAbandon}
      />
    </>
  );
}
