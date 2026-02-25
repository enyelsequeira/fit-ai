import { Box, Group, Paper, Text, ThemeIcon } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";

import styles from "./chat-message.module.css";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
};

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";
  const paragraphs = content.split("\n\n");

  return (
    <div className={`${styles.message} ${isUser ? styles.userMessage : styles.assistantMessage}`}>
      <Group align="flex-start" gap="sm" wrap="nowrap">
        {!isUser && (
          <ThemeIcon variant="light" color="teal" size="md" radius="xl" style={{ flexShrink: 0 }}>
            <IconSparkles size={16} />
          </ThemeIcon>
        )}
        <Paper className={isUser ? styles.userBubble : styles.assistantBubble} p="sm">
          {paragraphs.map((paragraph, i) => {
            const isLast = i === paragraphs.length - 1;
            return (
              <Text key={i} fz="sm" mb={isLast ? 0 : "xs"} style={{ whiteSpace: "pre-wrap" }}>
                {paragraph}
                {isStreaming && isLast && <Box component="span" className={styles.cursor} />}
              </Text>
            );
          })}
        </Paper>
      </Group>
    </div>
  );
}
