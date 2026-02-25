import { Group, Loader, Spoiler, Text, ThemeIcon } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

import { TOOL_DISPLAY_NAMES } from "../constants";
import { ToolOutputDetail } from "./tool-output-detail";
import styles from "./tool-call-display.module.css";

type ToolCallDisplayProps = {
  name: string;
  state: string;
  output?: Record<string, unknown>;
};

export function ToolCallDisplay({ name, state, output }: ToolCallDisplayProps) {
  const displayName = TOOL_DISPLAY_NAMES[name] ?? name;
  // TanStack AI states: "awaiting-input" | "input-streaming" | "input-complete"
  // A tool is done when state is "input-complete" or output exists
  const isComplete = state === "input-complete" || output !== undefined;

  const getResultSummary = (): string => {
    if (!output) return "Done";

    if (name === "search_exercises" && Array.isArray(output.exercises)) {
      return `${output.exercises.length} exercises found`;
    }
    if (name === "create_workout_template" && output.name) {
      return `Created: ${output.name}`;
    }
    if (name === "add_exercise_to_template" && output.exerciseName) {
      return `Added: ${output.exerciseName}`;
    }
    if (name === "delete_template" && output.message) {
      return String(output.message);
    }
    if (name === "log_workout" && output.exerciseName) {
      return `Logged: ${output.exerciseName} (${output.setsLogged} sets)`;
    }
    if (name === "get_progress_summary") {
      const goals = Array.isArray(output.activeGoals) ? output.activeGoals.length : 0;
      return `${goals} active goals, streak: ${output.currentStreak ?? 0} days`;
    }
    if (name === "suggest_exercise_alternatives" && Array.isArray(output.alternatives)) {
      return `${output.alternatives.length} alternatives found`;
    }

    return "Done";
  };

  const hasDetailedOutput =
    output &&
    [
      "search_exercises",
      "get_template_details",
      "list_user_templates",
      "get_progress_summary",
      "suggest_exercise_alternatives",
      "log_workout",
    ].includes(name);

  if (!isComplete) {
    return (
      <div className={styles.toolCall}>
        <Group gap="xs" wrap="nowrap">
          <Loader size={14} color="teal" />
          <Text fz="xs" c="dimmed">
            {displayName}...
          </Text>
        </Group>
      </div>
    );
  }

  return (
    <div className={styles.toolCall}>
      <Spoiler
        maxHeight={24}
        showLabel="Show details"
        hideLabel="Hide details"
        styles={{
          control: {
            fontSize: "var(--mantine-font-size-xs)",
            color: "var(--mantine-color-teal-6)",
          },
        }}
      >
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon variant="light" color="teal" size="xs" radius="xl">
            <IconCheck size={10} />
          </ThemeIcon>
          <Text fz="xs" c="dimmed">
            {displayName} — {getResultSummary()}
          </Text>
        </Group>
        {hasDetailedOutput && <ToolOutputDetail name={name} output={output} />}
      </Spoiler>
    </div>
  );
}
