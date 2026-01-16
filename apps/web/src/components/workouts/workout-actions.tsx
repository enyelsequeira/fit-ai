/**
 * WorkoutActions - Quick action buttons for starting workouts
 * Provides prominent CTAs for different user workflows
 */

import { Box, Text, UnstyledButton } from "@mantine/core";
import { IconClipboardList, IconTemplate, IconPlus } from "@tabler/icons-react";
import { FitAiCard, FitAiCardContent } from "@/components/ui/card";
import styles from "./workout-actions.module.css";

interface ActionItem {
  id: string;
  label: string;
  description: string;
  icon: typeof IconPlus;
  variant?: "primary" | "default";
}

const actions: ActionItem[] = [
  {
    id: "start",
    label: "Start Workout",
    description: "Begin a new session",
    icon: IconPlus,
    variant: "primary",
  },
  {
    id: "template",
    label: "Use Template",
    description: "Start from saved routine",
    icon: IconTemplate,
  },
  {
    id: "quick-log",
    label: "Quick Log",
    description: "Log a past workout",
    icon: IconClipboardList,
  },
];

interface WorkoutActionsProps {
  onStartWorkout: () => void;
  onUseTemplate: () => void;
  onQuickLog: () => void;
}

export function WorkoutActions({ onStartWorkout, onUseTemplate, onQuickLog }: WorkoutActionsProps) {
  const handleClick = (actionId: string) => {
    switch (actionId) {
      case "start":
        onStartWorkout();
        break;
      case "template":
        onUseTemplate();
        break;
      case "quick-log":
        onQuickLog();
        break;
    }
  };

  return (
    <FitAiCard className={styles.actionsCard}>
      <FitAiCardContent>
        <Box className={styles.actionsContainer}>
          {actions.map((action) => (
            <UnstyledButton
              key={action.id}
              className={styles.actionButton}
              data-variant={action.variant ?? "default"}
              onClick={() => handleClick(action.id)}
            >
              <Box className={styles.actionIcon}>
                <action.icon size={20} />
              </Box>
              <Box>
                <Text className={styles.actionLabel}>{action.label}</Text>
                <Text className={styles.actionDescription}>{action.description}</Text>
              </Box>
            </UnstyledButton>
          ))}
        </Box>
      </FitAiCardContent>
    </FitAiCard>
  );
}
