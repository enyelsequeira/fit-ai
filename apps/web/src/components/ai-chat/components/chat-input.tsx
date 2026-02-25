import { useState } from "react";
import { Group, Text, Textarea } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";

import { FitAiActionIcon } from "@/components/ui/fit-ai-button/fit-ai-action-icon";

type ChatInputProps = {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
};

export function ChatInput({ onSend, isLoading, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
      <Group gap="sm" align="flex-end" wrap="nowrap">
        <Textarea
          flex={1}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Ask FitAI about workouts, exercises, or plans..."}
          disabled={isLoading}
          autosize
          minRows={1}
          maxRows={4}
          radius="md"
        />
        <FitAiActionIcon
          variant="primary"
          size="lg"
          onClick={handleSend}
          disabled={!value.trim() || isLoading}
          loading={isLoading}
          aria-label="Send message"
        >
          <IconSend size={18} />
        </FitAiActionIcon>
      </Group>
      <Text fz={11} c="dimmed" mt={4} ta="center">
        Press Enter to send, Shift+Enter for new line
      </Text>
    </div>
  );
}
