import type { ChatClientState } from "@tanstack/ai-client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createChatClientOptions } from "@tanstack/ai-client";
import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import { env } from "@fit-ai/env/web";

import { AI_CHAT_ENDPOINT } from "../constants";
import { useSaveChatMessages } from "./use-mutations";

const chatOptions = createChatClientOptions({
  connection: fetchServerSentEvents(`${env.VITE_SERVER_URL}${AI_CHAT_ENDPOINT}`, {
    credentials: "include" as RequestCredentials,
  }),
});

function truncateAtWordBoundary(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
}

export function useChatSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const prevStatusRef = useRef<ChatClientState>("ready");
  const titleRef = useRef<string>("");

  const {
    messages,
    sendMessage: chatSendMessage,
    setMessages,
    clear,
    isLoading,
    error,
    status,
  } = useChat(chatOptions);
  const saveMutation = useSaveChatMessages();

  // Keep ref in sync
  sessionIdRef.current = sessionId;

  // Auto-save when streaming finishes (status transitions from active to ready)
  // Skip save when the stream ended with an error (RUN_ERROR from model)
  useEffect(() => {
    const wasActive =
      prevStatusRef.current === "streaming" || prevStatusRef.current === "submitted";
    const isNowReady = status === "ready";
    prevStatusRef.current = status;

    if (wasActive && isNowReady && !error && sessionIdRef.current && messages.length > 0) {
      const mappedMessages = messages.map((msg) => {
        const textContent = msg.parts
          .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
          .map((p) => p.content)
          .join("");

        const toolCalls = msg.parts.filter(
          (p): p is Extract<typeof p, { type: "tool-call" }> => p.type === "tool-call",
        );

        return {
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: textContent,
          toolCalls: toolCalls.length > 0 ? toolCalls : null,
        };
      });

      saveMutation.mutate({
        sessionId: sessionIdRef.current,
        title: titleRef.current || "New Chat",
        messages: mappedMessages,
      });
    }
  }, [status, messages, error, saveMutation]);

  const sendMessage = useCallback(
    (text: string) => {
      let currentSessionId = sessionIdRef.current;

      if (!currentSessionId) {
        currentSessionId = crypto.randomUUID();
        titleRef.current = truncateAtWordBoundary(text, 80);
        setSessionId(currentSessionId);
        sessionIdRef.current = currentSessionId;
      }

      chatSendMessage(text);
    },
    [chatSendMessage],
  );

  const startNewChat = useCallback(() => {
    setSessionId(null);
    sessionIdRef.current = null;
    titleRef.current = "";
    clear();
  }, [clear]);

  return {
    sessionId,
    setSessionId,
    messages,
    setMessages,
    sendMessage,
    isLoading,
    error,
    status,
    startNewChat,
    saveStatus: saveMutation.status,
  };
}
