import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

function useInvalidateGoals() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: orpc.goals.list.key() });
    queryClient.invalidateQueries({ queryKey: orpc.goals.getSummary.key() });
  };
}

export function useCompleteGoal() {
  const invalidate = useInvalidateGoals();
  return useMutation(orpc.goals.complete.mutationOptions({ onSuccess: invalidate }));
}

export function usePauseGoal() {
  const invalidate = useInvalidateGoals();
  return useMutation(orpc.goals.pause.mutationOptions({ onSuccess: invalidate }));
}

export function useResumeGoal() {
  const invalidate = useInvalidateGoals();
  return useMutation(orpc.goals.resume.mutationOptions({ onSuccess: invalidate }));
}

export function useAbandonGoal() {
  const invalidate = useInvalidateGoals();
  return useMutation(orpc.goals.abandon.mutationOptions({ onSuccess: invalidate }));
}

export function useDeleteGoal() {
  const invalidate = useInvalidateGoals();
  return useMutation(orpc.goals.delete.mutationOptions({ onSuccess: invalidate }));
}

export function useUpdateGoalProgress() {
  const invalidate = useInvalidateGoals();
  return useMutation(orpc.goals.updateProgress.mutationOptions({ onSuccess: invalidate }));
}

export function useUpdateGoal() {
  const invalidate = useInvalidateGoals();
  return useMutation(orpc.goals.update.mutationOptions({ onSuccess: invalidate }));
}

export function useCreateWeightGoal() {
  const invalidate = useInvalidateGoals();
  return useMutation(orpc.goals.createWeightGoal.mutationOptions({ onSuccess: invalidate }));
}

export function useCreateStrengthGoal() {
  const invalidate = useInvalidateGoals();
  return useMutation(orpc.goals.createStrengthGoal.mutationOptions({ onSuccess: invalidate }));
}

export function useCreateBodyMeasurementGoal() {
  const invalidate = useInvalidateGoals();
  return useMutation(
    orpc.goals.createBodyMeasurementGoal.mutationOptions({ onSuccess: invalidate }),
  );
}

export function useCreateWorkoutFrequencyGoal() {
  const invalidate = useInvalidateGoals();
  return useMutation(
    orpc.goals.createWorkoutFrequencyGoal.mutationOptions({ onSuccess: invalidate }),
  );
}

export function useCreateCustomGoal() {
  const invalidate = useInvalidateGoals();
  return useMutation(orpc.goals.createCustomGoal.mutationOptions({ onSuccess: invalidate }));
}

export function useCreateGoalMutations() {
  const createWeight = useCreateWeightGoal();
  const createStrength = useCreateStrengthGoal();
  const createBodyMeasurement = useCreateBodyMeasurementGoal();
  const createWorkoutFrequency = useCreateWorkoutFrequencyGoal();
  const createCustom = useCreateCustomGoal();
  return {
    createWeight,
    createStrength,
    createBodyMeasurement,
    createWorkoutFrequency,
    createCustom,
    isCreating:
      createWeight.isPending ||
      createStrength.isPending ||
      createBodyMeasurement.isPending ||
      createWorkoutFrequency.isPending ||
      createCustom.isPending,
  };
}
