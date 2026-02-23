import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

export function useUpdateUnits() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.settings.updateUnits.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.settings.get.key() });
      },
    }),
  );
}

export function useUpdateDisplay() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.settings.updateDisplayPreferences.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.settings.get.key() });
      },
    }),
  );
}

export function useUpdateNotifications() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.settings.updateNotificationPreferences.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.settings.get.key() });
      },
    }),
  );
}
