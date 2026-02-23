import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

function useInvalidateRecords() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: orpc.personalRecord.list.key() });
    queryClient.invalidateQueries({ queryKey: orpc.personalRecord.getSummary.key() });
    queryClient.invalidateQueries({ queryKey: orpc.personalRecord.getRecent.key() });
  };
}

export function useCreateRecord() {
  const invalidate = useInvalidateRecords();
  return useMutation(orpc.personalRecord.create.mutationOptions({ onSuccess: invalidate }));
}

export function useUpdateRecord() {
  const invalidate = useInvalidateRecords();
  const queryClient = useQueryClient();
  return useMutation(
    orpc.personalRecord.update.mutationOptions({
      onSuccess: (_data, variables) => {
        invalidate();
        queryClient.invalidateQueries({
          queryKey: orpc.personalRecord.getById.key({ input: { id: variables.id } }),
        });
      },
    }),
  );
}

export function useDeleteRecord() {
  const invalidate = useInvalidateRecords();
  return useMutation(orpc.personalRecord.delete.mutationOptions({ onSuccess: invalidate }));
}
