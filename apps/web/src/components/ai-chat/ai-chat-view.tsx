import type { UIMessage } from "@tanstack/ai-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActionIcon, Group, Loader, Overlay, ScrollArea, Text } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconAlertCircle, IconCheck, IconMenu2, IconTrash } from "@tabler/icons-react";

import { FitAiDeleteModal } from "@/components/ui/fit-ai-delete-modal/fit-ai-delete-modal";

import { ChatInput } from "./components/chat-input";
import { ChatSidebar } from "./components/chat-sidebar/chat-sidebar";
import { ErrorBanner } from "./components/error-banner";
import { MessageList } from "./components/message-list";
import { SuggestedPrompts } from "./components/suggested-prompts";
import { useChatSession } from "./hooks/use-chat-session";
import { useDeleteChatSession } from "./hooks/use-mutations";
import { useSuggestedPrompts } from "./hooks/use-suggested-prompts";
import { useChatSessionList, useChatSessionMessages } from "./queries/use-queries";
import styles from "./ai-chat-view.module.css";

/** Convert persisted messages into the UIMessage shape that useChat expects. */
function toUIMessages(
  messages: { id: string; role: "user" | "assistant"; content: string }[],
): UIMessage[] {
  return messages.map((m) => ({
    id: m.id,
    role: m.role,
    parts: [{ type: "text" as const, content: m.content }],
  }));
}

export function AiChatView() {
  const {
    sessionId,
    setSessionId,
    messages,
    setMessages,
    sendMessage,
    isLoading,
    error,
    status,
    startNewChat,
    saveStatus,
  } = useChatSession();

  const { data: sessionData } = useChatSessionList();
  const sessions = sessionData?.sessions ?? [];
  const deleteMutation = useDeleteChatSession();
  const { prompts, isLoading: promptsLoading } = useSuggestedPrompts();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const [sidebarOpened, { toggle: toggleSidebar, close: closeSidebar }] = useDisclosure(false);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Only fetch history for sessions explicitly selected from sidebar (not newly created ones)
  const [loadHistoryFor, setLoadHistoryFor] = useState<string | null>(null);
  const { data: historyData } = useChatSessionMessages(loadHistoryFor);
  const loadedSessionRef = useRef<string | null>(null);

  // Load historical messages into the chat when we select a past session
  useEffect(() => {
    if (!sessionId || !historyData?.messages || loadedSessionRef.current === sessionId) return;
    if (messages.length > 0) return; // Already has messages (active conversation)
    loadedSessionRef.current = sessionId;
    setMessages(toUIMessages(historyData.messages));
  }, [sessionId, historyData, messages.length, setMessages]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [lastRetry, setLastRetry] = useState(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback((text: string) => sendMessage(text), [sendMessage]);

  const handleRetry = useCallback(() => {
    setLastRetry(Date.now());
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      const textPart = lastUserMsg.parts.find((p) => p.type === "text");
      if (textPart && textPart.type === "text") {
        sendMessage(textPart.content);
      }
    }
  }, [messages, sendMessage, lastRetry]);

  const handleSelectSession = useCallback(
    (id: string) => {
      if (id === sessionId) return;
      loadedSessionRef.current = null;
      setMessages([]);
      setSessionId(id);
      setLoadHistoryFor(id);
      closeSidebar();
    },
    [sessionId, setSessionId, setMessages, closeSidebar],
  );

  const handleNewChat = useCallback(() => {
    loadedSessionRef.current = null;
    setLoadHistoryFor(null);
    startNewChat();
    closeSidebar();
  }, [startNewChat, closeSidebar]);

  const handleDeleteSession = useCallback((id: string) => {
    setDeleteTarget(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate({ sessionId: deleteTarget });
    if (deleteTarget === sessionId) {
      loadedSessionRef.current = null;
      setLoadHistoryFor(null);
      startNewChat();
    }
    setDeleteTarget(null);
  }, [deleteTarget, deleteMutation, sessionId, startNewChat]);

  const hasError = status === "error" || error !== undefined;
  const showSidebar = !isMobile || sidebarOpened;

  return (
    <div className={styles.container}>
      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpened && (
        <Overlay
          className={styles.backdrop}
          onClick={closeSidebar}
          backgroundOpacity={0.35}
          zIndex={9}
        />
      )}

      {/* Sidebar: always visible on desktop, overlay on mobile */}
      {showSidebar && (
        <div className={isMobile ? styles.sidebarOverlay : undefined}>
          <ChatSidebar
            sessions={sessions}
            activeSessionId={sessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
          />
        </div>
      )}

      <div className={styles.chatArea}>
        {isMobile && (
          <Group className={styles.mobileBar} gap="sm" px="sm" py="xs">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              onClick={toggleSidebar}
              aria-label="Toggle chat history"
            >
              <IconMenu2 size={18} />
            </ActionIcon>
            <Text fz="sm" fw={500} c="dimmed">
              FitAI Coach
            </Text>
          </Group>
        )}

        {hasError && <ErrorBanner error={error} onRetry={handleRetry} />}

        <ScrollArea className={styles.messagesArea} p="md" viewportRef={scrollRef}>
          {messages.length === 0 ? (
            <SuggestedPrompts onSelect={handleSend} prompts={prompts} isLoading={promptsLoading} />
          ) : (
            <>
              <MessageList messages={messages} isLoading={isLoading} />
              <div ref={bottomRef} />
            </>
          )}
        </ScrollArea>

        <div className={styles.inputArea}>
          <ChatInput onSend={handleSend} isLoading={isLoading} />
          {saveStatus !== "idle" && (
            <Group gap={4} justify="center" mt={4}>
              {saveStatus === "pending" && (
                <>
                  <Loader size={10} color="teal" />
                  <Text fz={10} c="dimmed">
                    Saving...
                  </Text>
                </>
              )}
              {saveStatus === "success" && (
                <>
                  <IconCheck size={10} color="var(--mantine-color-teal-6)" />
                  <Text fz={10} c="dimmed">
                    Saved
                  </Text>
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <IconAlertCircle size={10} color="var(--mantine-color-red-6)" />
                  <Text fz={10} c="red">
                    Save failed
                  </Text>
                </>
              )}
            </Group>
          )}
        </div>
      </div>

      <FitAiDeleteModal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <FitAiDeleteModal.Icon>
          <IconTrash size={32} />
        </FitAiDeleteModal.Icon>
        <FitAiDeleteModal.Title>Delete Conversation</FitAiDeleteModal.Title>
        <FitAiDeleteModal.Message>
          This conversation and all its messages will be permanently deleted. This cannot be undone.
        </FitAiDeleteModal.Message>
        <FitAiDeleteModal.Actions>
          <FitAiDeleteModal.CancelButton>Cancel</FitAiDeleteModal.CancelButton>
          <FitAiDeleteModal.ConfirmButton
            onClick={confirmDelete}
            loading={deleteMutation.isPending}
          >
            Delete
          </FitAiDeleteModal.ConfirmButton>
        </FitAiDeleteModal.Actions>
      </FitAiDeleteModal>
    </div>
  );
}
