import type { UIMessage } from "@tanstack/ai-react";
import { Stack } from "@mantine/core";

import { ChatMessage } from "./chat-message";
import { TemplatePreviewCard } from "./template-preview-card";
import { ToolCallDisplay } from "./tool-call-display";

type MessageListProps = {
  messages: UIMessage[];
  isLoading: boolean;
};

export function MessageList({ messages, isLoading }: MessageListProps) {
  const chatMessages = messages.filter(
    (m): m is UIMessage & { role: "user" | "assistant" } =>
      m.role === "user" || m.role === "assistant",
  );

  return (
    <Stack gap="md">
      {chatMessages.map((msg) => {
        const textParts = msg.parts.filter((p) => p.type === "text" && p.content.trim() !== "");
        const toolParts = msg.parts.filter((p) => p.type === "tool-call");

        const templateToolCall = toolParts.find(
          (p) =>
            p.type === "tool-call" &&
            p.name === "create_workout_template" &&
            (p.state === "input-complete" || p.output !== undefined),
        );
        const templateOutput =
          templateToolCall?.type === "tool-call"
            ? (templateToolCall.output as { id?: number; name?: string } | undefined)
            : undefined;

        return (
          <div key={msg.id}>
            {textParts.map((part, idx) => (
              <ChatMessage
                key={`text-${idx}`}
                role={msg.role}
                content={part.type === "text" ? part.content : ""}
                isStreaming={isLoading && idx === textParts.length - 1 && msg.role === "assistant"}
              />
            ))}
            {toolParts.length > 0 && (
              <Stack gap={4} mt={4} ml={36}>
                {toolParts.map((part, idx) =>
                  part.type === "tool-call" ? (
                    <ToolCallDisplay
                      key={`tool-${idx}`}
                      name={part.name}
                      state={part.state}
                      output={part.output as Record<string, unknown>}
                    />
                  ) : null,
                )}
              </Stack>
            )}
            {templateOutput?.id && templateOutput.name && (
              <TemplatePreviewCard
                templateId={templateOutput.id}
                templateName={templateOutput.name}
              />
            )}
          </div>
        );
      })}
    </Stack>
  );
}
