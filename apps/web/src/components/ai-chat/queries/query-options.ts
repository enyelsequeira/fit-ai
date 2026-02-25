import { orpc } from "@/utils/orpc";

export function chatSessionListOptions(params?: { limit?: number; offset?: number }) {
  return orpc.chatSession.list.queryOptions({
    input: { limit: params?.limit ?? 50, offset: params?.offset ?? 0 },
  });
}

export function chatSessionMessagesOptions(params: { sessionId: string }) {
  return orpc.chatSession.getMessages.queryOptions({
    input: { sessionId: params.sessionId },
  });
}
