import { Paper, SimpleGrid, Skeleton, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconBarbell, IconSparkles, IconStretching, IconTarget } from "@tabler/icons-react";

import classes from "./suggested-prompts.module.css";

const PROMPT_ICONS = [
  IconBarbell,
  IconStretching,
  IconTarget,
  IconBarbell,
  IconStretching,
  IconTarget,
];

type SuggestedPromptsProps = {
  onSelect: (prompt: string) => void;
  prompts: string[];
  isLoading?: boolean;
};

export function SuggestedPrompts({ onSelect, prompts, isLoading }: SuggestedPromptsProps) {
  return (
    <div className={classes.wrapper}>
      <div className={classes.branding}>
        <ThemeIcon variant="light" color="teal" size={56} radius="xl">
          <IconSparkles size={28} />
        </ThemeIcon>
        <Stack gap={4}>
          <Text fw={700} fz="xl">
            FitAI Coach
          </Text>
          <Text c="dimmed" fz="sm">
            Your personal fitness assistant. Try asking:
          </Text>
        </Stack>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" w="100%" maw={560}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`skeleton-${String(i)}`} height={72} radius="md" />
            ))
          : prompts.map((prompt, i) => {
              const Icon = PROMPT_ICONS[i % PROMPT_ICONS.length] ?? IconBarbell;
              return (
                <Paper
                  key={prompt}
                  className={classes.card}
                  p="sm"
                  radius="md"
                  tabIndex={0}
                  role="button"
                  onClick={() => onSelect(prompt)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onSelect(prompt);
                  }}
                >
                  <div className={classes.cardContent}>
                    <Icon size={18} className={classes.cardIcon} />
                    <Text className={classes.promptText}>{prompt}</Text>
                  </div>
                </Paper>
              );
            })}
      </SimpleGrid>
    </div>
  );
}
