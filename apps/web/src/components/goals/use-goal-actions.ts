/**
 * Custom hook for goal action handlers
 * Encapsulates all mutation handlers with notification logic
 */

import { useCallback } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import {
  showErrorNotification,
  showGoalNotification,
  showSuccessNotification,
} from "@/utils/notifications";
import type { GoalWithExercise } from "./types";

/**
 * Type definitions for the mutations passed to the hook
 */
export interface GoalMutations {
  completeMutation: UseMutationResult<unknown, Error, { id: number }>;
  pauseMutation: UseMutationResult<unknown, Error, { id: number }>;
  resumeMutation: UseMutationResult<unknown, Error, { id: number }>;
  abandonMutation: UseMutationResult<unknown, Error, { id: number }>;
  deleteMutation: UseMutationResult<unknown, Error, { id: number }>;
  updateProgressMutation: UseMutationResult<
    unknown,
    Error,
    { goalId: number; value: number; note?: string }
  >;
  createWeightGoalMutation: UseMutationResult<unknown, Error, unknown>;
  createStrengthGoalMutation: UseMutationResult<unknown, Error, unknown>;
  createBodyMeasurementGoalMutation: UseMutationResult<unknown, Error, unknown>;
  createWorkoutFrequencyGoalMutation: UseMutationResult<unknown, Error, unknown>;
  createCustomGoalMutation: UseMutationResult<unknown, Error, unknown>;
}

interface UseGoalActionsOptions {
  mutations: GoalMutations;
  closeCreateModal: () => void;
  closeLogProgressModal: () => void;
  closeDetailModal: () => void;
  openLogProgressModal: () => void;
  setSelectedGoal: (goal: GoalWithExercise | null) => void;
  goalDetail: GoalWithExercise | null;
}

export interface GoalActionHandlers {
  handleComplete: (goal: GoalWithExercise) => Promise<void>;
  handlePause: (goal: GoalWithExercise) => Promise<void>;
  handleResume: (goal: GoalWithExercise) => Promise<void>;
  handleAbandon: (goal: GoalWithExercise) => Promise<void>;
  handleDelete: (goal: GoalWithExercise) => Promise<void>;
  handleLogProgressSubmit: (data: {
    goalId: number;
    value: number;
    note?: string;
  }) => Promise<void>;
  handleCreateWeightGoal: (data: unknown) => Promise<void>;
  handleCreateStrengthGoal: (data: unknown) => Promise<void>;
  handleCreateBodyMeasurementGoal: (data: unknown) => Promise<void>;
  handleCreateWorkoutFrequencyGoal: (data: unknown) => Promise<void>;
  handleCreateCustomGoal: (data: unknown) => Promise<void>;
  handleDetailLogProgress: () => void;
  handleDetailComplete: () => Promise<void>;
  handleDetailPause: () => Promise<void>;
  handleDetailResume: () => Promise<void>;
  handleDetailAbandon: () => Promise<void>;
  isCreating: boolean;
}

/**
 * Custom hook that encapsulates all goal action handlers
 * Reduces boilerplate in the main view component by centralizing
 * mutation handling and notification logic
 */
export function useGoalActions({
  mutations,
  closeCreateModal,
  closeLogProgressModal,
  closeDetailModal,
  openLogProgressModal,
  setSelectedGoal,
  goalDetail,
}: UseGoalActionsOptions): GoalActionHandlers {
  const {
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
  } = mutations;

  // Goal status action handlers
  const handleComplete = useCallback(
    async (goal: GoalWithExercise) => {
      try {
        await completeMutation.mutateAsync({ id: goal.id });
        showSuccessNotification(
          "Goal Completed",
          `Congratulations! You've completed "${goal.title}"`,
        );
      } catch {
        showErrorNotification("Error", "Failed to complete goal");
      }
    },
    [completeMutation],
  );

  const handlePause = useCallback(
    async (goal: GoalWithExercise) => {
      try {
        await pauseMutation.mutateAsync({ id: goal.id });
        showGoalNotification("warning", "Goal Paused", `"${goal.title}" has been paused`);
      } catch {
        showErrorNotification("Error", "Failed to pause goal");
      }
    },
    [pauseMutation],
  );

  const handleResume = useCallback(
    async (goal: GoalWithExercise) => {
      try {
        await resumeMutation.mutateAsync({ id: goal.id });
        showSuccessNotification("Goal Resumed", `"${goal.title}" is now active again`);
      } catch {
        showErrorNotification("Error", "Failed to resume goal");
      }
    },
    [resumeMutation],
  );

  const handleAbandon = useCallback(
    async (goal: GoalWithExercise) => {
      try {
        await abandonMutation.mutateAsync({ id: goal.id });
        showGoalNotification("warning", "Goal Abandoned", `"${goal.title}" has been abandoned`);
      } catch {
        showErrorNotification("Error", "Failed to abandon goal");
      }
    },
    [abandonMutation],
  );

  const handleDelete = useCallback(
    async (goal: GoalWithExercise) => {
      try {
        await deleteMutation.mutateAsync({ id: goal.id });
        showErrorNotification("Goal Deleted", `"${goal.title}" has been deleted`);
      } catch {
        showErrorNotification("Error", "Failed to delete goal");
      }
    },
    [deleteMutation],
  );

  // Progress logging handler
  const handleLogProgressSubmit = useCallback(
    async (data: { goalId: number; value: number; note?: string }) => {
      try {
        await updateProgressMutation.mutateAsync(data);
        showSuccessNotification("Progress Logged", "Your progress has been recorded");
        closeLogProgressModal();
      } catch {
        showErrorNotification("Error", "Failed to log progress");
      }
    },
    [updateProgressMutation, closeLogProgressModal],
  );

  // Goal creation handlers
  const handleCreateWeightGoal = useCallback(
    async (data: unknown) => {
      try {
        await createWeightGoalMutation.mutateAsync(data);
        showSuccessNotification("Goal Created", "Your weight goal has been created");
        closeCreateModal();
      } catch {
        showErrorNotification("Error", "Failed to create goal");
      }
    },
    [createWeightGoalMutation, closeCreateModal],
  );

  const handleCreateStrengthGoal = useCallback(
    async (data: unknown) => {
      try {
        await createStrengthGoalMutation.mutateAsync(data);
        showSuccessNotification("Goal Created", "Your strength goal has been created");
        closeCreateModal();
      } catch {
        showErrorNotification("Error", "Failed to create goal");
      }
    },
    [createStrengthGoalMutation, closeCreateModal],
  );

  const handleCreateBodyMeasurementGoal = useCallback(
    async (data: unknown) => {
      try {
        await createBodyMeasurementGoalMutation.mutateAsync(data);
        showSuccessNotification("Goal Created", "Your body measurement goal has been created");
        closeCreateModal();
      } catch {
        showErrorNotification("Error", "Failed to create goal");
      }
    },
    [createBodyMeasurementGoalMutation, closeCreateModal],
  );

  const handleCreateWorkoutFrequencyGoal = useCallback(
    async (data: unknown) => {
      try {
        await createWorkoutFrequencyGoalMutation.mutateAsync(data);
        showSuccessNotification("Goal Created", "Your workout frequency goal has been created");
        closeCreateModal();
      } catch {
        showErrorNotification("Error", "Failed to create goal");
      }
    },
    [createWorkoutFrequencyGoalMutation, closeCreateModal],
  );

  const handleCreateCustomGoal = useCallback(
    async (data: unknown) => {
      try {
        await createCustomGoalMutation.mutateAsync(data);
        showSuccessNotification("Goal Created", "Your custom goal has been created");
        closeCreateModal();
      } catch {
        showErrorNotification("Error", "Failed to create goal");
      }
    },
    [createCustomGoalMutation, closeCreateModal],
  );

  // Detail modal action handlers
  const handleDetailLogProgress = useCallback(() => {
    if (goalDetail) {
      setSelectedGoal(goalDetail);
      closeDetailModal();
      openLogProgressModal();
    }
  }, [goalDetail, closeDetailModal, openLogProgressModal, setSelectedGoal]);

  const handleDetailComplete = useCallback(async () => {
    if (goalDetail) {
      await handleComplete(goalDetail);
      closeDetailModal();
    }
  }, [goalDetail, handleComplete, closeDetailModal]);

  const handleDetailPause = useCallback(async () => {
    if (goalDetail) {
      await handlePause(goalDetail);
      closeDetailModal();
    }
  }, [goalDetail, handlePause, closeDetailModal]);

  const handleDetailResume = useCallback(async () => {
    if (goalDetail) {
      await handleResume(goalDetail);
      closeDetailModal();
    }
  }, [goalDetail, handleResume, closeDetailModal]);

  const handleDetailAbandon = useCallback(async () => {
    if (goalDetail) {
      await handleAbandon(goalDetail);
      closeDetailModal();
    }
  }, [goalDetail, handleAbandon, closeDetailModal]);

  const isCreating =
    createWeightGoalMutation.isPending ||
    createStrengthGoalMutation.isPending ||
    createBodyMeasurementGoalMutation.isPending ||
    createWorkoutFrequencyGoalMutation.isPending ||
    createCustomGoalMutation.isPending;

  return {
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
  };
}
