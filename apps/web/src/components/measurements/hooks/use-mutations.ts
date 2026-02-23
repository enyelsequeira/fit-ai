import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

function useInvalidateMeasurements() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: orpc.bodyMeasurement.list.key() });
    queryClient.invalidateQueries({ queryKey: orpc.bodyMeasurement.getLatest.key() });
    queryClient.invalidateQueries({ queryKey: orpc.bodyMeasurement.getTrends.key() });
  };
}

export function useCreateMeasurement() {
  const invalidate = useInvalidateMeasurements();
  return useMutation(orpc.bodyMeasurement.create.mutationOptions({ onSuccess: invalidate }));
}

export function useUpdateMeasurement() {
  const invalidate = useInvalidateMeasurements();
  return useMutation(orpc.bodyMeasurement.update.mutationOptions({ onSuccess: invalidate }));
}

export function useDeleteMeasurement() {
  const invalidate = useInvalidateMeasurements();
  return useMutation(orpc.bodyMeasurement.delete.mutationOptions({ onSuccess: invalidate }));
}
