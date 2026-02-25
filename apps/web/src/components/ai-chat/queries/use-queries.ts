import { useQuery } from "@tanstack/react-query";

import { chatSessionListOptions, chatSessionMessagesOptions } from "./query-options";

export function useChatSessionList() {
  return useQuery(chatSessionListOptions());
}

export function useChatSessionMessages(sessionId: string | null) {
  return useQuery({
    ...chatSessionMessagesOptions({ sessionId: sessionId ?? "" }),
    enabled: !!sessionId,
  });
}
