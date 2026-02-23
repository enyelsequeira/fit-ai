import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

function useInvalidateRecovery() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: orpc.recovery.getTodayCheckIn.key() });
    queryClient.invalidateQueries({ queryKey: orpc.recovery.getReadiness.key() });
    queryClient.invalidateQueries({ queryKey: orpc.recovery.getRecoveryStatus.key() });
    queryClient.invalidateQueries({ queryKey: orpc.recovery.getTrends.key() });
    queryClient.invalidateQueries({ queryKey: orpc.recovery.getCheckInHistory.key() });
  };
}

export function useCreateCheckIn() {
  const invalidate = useInvalidateRecovery();
  return useMutation(orpc.recovery.createCheckIn.mutationOptions({ onSuccess: invalidate }));
}

export function useRefreshRecovery() {
  const invalidate = useInvalidateRecovery();
  return useMutation(orpc.recovery.refreshRecovery.mutationOptions({ onSuccess: invalidate }));
}

export function useDeleteCheckIn() {
  const invalidate = useInvalidateRecovery();
  return useMutation(orpc.recovery.deleteCheckIn.mutationOptions({ onSuccess: invalidate }));
}
