import type { SessionItem } from "../../utils";

import { IconMessage, IconPlus, IconTrash } from "@tabler/icons-react";

import { FitAiActionIcon } from "@/components/ui/fit-ai-button/fit-ai-action-icon";
import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import { FitAiSidebar } from "@/components/ui/fit-ai-sidebar/fit-ai-sidebar";

import { groupSessionsByDate } from "../../utils";

type ChatSidebarProps = {
  sessions: SessionItem[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
};

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: ChatSidebarProps) {
  const grouped = groupSessionsByDate(sessions);
  const totalMessages = sessions.reduce((sum, s) => sum + s.messageCount, 0);

  return (
    <FitAiSidebar selectedId={activeSessionId} onSelect={(id) => onSelectSession(String(id))}>
      <FitAiSidebar.Header
        title="Chat History"
        action={
          <FitAiButton variant="primary" size="sm" onClick={onNewChat} fullWidth>
            <IconPlus size={16} style={{ marginRight: 4 }} /> New Chat
          </FitAiButton>
        }
      />
      <FitAiSidebar.Navigation>
        {sessions.length === 0 ? (
          <FitAiSidebar.EmptyState
            icon={<IconMessage size={32} />}
            title="No conversations yet"
            description="Start a new chat to get AI-powered fitness advice"
          />
        ) : (
          grouped.map((group) => (
            <FitAiSidebar.Section key={group.label} label={group.label}>
              {group.sessions.map((session) => (
                <FitAiSidebar.Item
                  key={session.id}
                  id={session.id}
                  label={session.title}
                  icon={<IconMessage size={16} />}
                  action={
                    <FitAiActionIcon
                      variant="danger"
                      size="xs"
                      aria-label={`Delete ${session.title}`}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                    >
                      <IconTrash size={14} />
                    </FitAiActionIcon>
                  }
                />
              ))}
            </FitAiSidebar.Section>
          ))
        )}
      </FitAiSidebar.Navigation>
      <FitAiSidebar.Stats
        stats={[
          { label: "Sessions", value: sessions.length },
          { label: "Messages", value: totalMessages },
        ]}
      />
    </FitAiSidebar>
  );
}
