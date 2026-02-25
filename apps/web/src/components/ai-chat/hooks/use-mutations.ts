import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

function useInvalidateChatSessions() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: orpc.chatSession.list.key() });
  };
}

export function useCreateChatSession() {
  const invalidate = useInvalidateChatSessions();
  return useMutation(orpc.chatSession.create.mutationOptions({ onSuccess: invalidate }));
}

export function useDeleteChatSession() {
  const invalidate = useInvalidateChatSessions();
  return useMutation(orpc.chatSession.delete.mutationOptions({ onSuccess: invalidate }));
}

export function useSaveChatMessages() {
  const invalidate = useInvalidateChatSessions();
  return useMutation(
    orpc.chatSession.save.mutationOptions({
      onSuccess: invalidate,
      onError: (error) => {
        console.error("[chat] Failed to save messages:", error);
      },
      retry: 2,
    }),
  );
}

export function useUpdateChatSessionTitle() {
  const invalidate = useInvalidateChatSessions();
  return useMutation(orpc.chatSession.updateTitle.mutationOptions({ onSuccess: invalidate }));
}
