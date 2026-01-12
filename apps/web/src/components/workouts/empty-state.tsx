/**
 * WorkoutEmptyState - Welcoming empty state for users with no workouts
 * Provides guidance and quick actions to get started
 */

import { Box, Button, Stack, Text, UnstyledButton } from "@mantine/core";
import {
  IconBarbell,
  IconBulb,
  IconCalendarEvent,
  IconTemplate,
  IconPlus,
  IconRun,
  IconStretching,
  IconWeight,
} from "@tabler/icons-react";
import { FitAiCard, FitAiCardContent } from "@/components/ui/card";
import styles from "./empty-state.module.css";

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  icon: typeof IconBarbell;
}

const templateOptions: TemplateOption[] = [
  {
    id: "strength",
    name: "Strength",
    description: "Build muscle",
    icon: IconWeight,
  },
  {
    id: "cardio",
    name: "Cardio",
    description: "Burn calories",
    icon: IconRun,
  },
  {
    id: "flexibility",
    name: "Flexibility",
    description: "Stretch & recover",
    icon: IconStretching,
  },
  {
    id: "full-body",
    name: "Full Body",
    description: "Complete workout",
    icon: IconBarbell,
  },
];

interface WorkoutEmptyStateProps {
  hasDateFilter: boolean;
  selectedDate: Date | null;
  onStartWorkout: () => void;
  onUseTemplate: () => void;
  onClearFilter?: () => void;
  onSelectTemplate?: (templateId: string) => void;
}

export function WorkoutEmptyState({
  hasDateFilter,
  selectedDate,
  onStartWorkout,
  onUseTemplate,
  onClearFilter,
  onSelectTemplate,
}: WorkoutEmptyStateProps) {
  // Different content based on whether a date filter is applied
  if (hasDateFilter && selectedDate) {
    return (
      <FitAiCard className={styles.emptyStateCard}>
        <FitAiCardContent>
          <Box className={styles.emptyContainer}>
            <Box className={styles.iconWrapper} data-variant="filtered">
              <IconCalendarEvent size={40} style={{ color: "var(--mantine-color-dimmed)" }} />
            </Box>
            <Text className={styles.title}>No workouts on this day</Text>
            <Text size="sm" c="dimmed" className={styles.description}>
              You don't have any workouts scheduled or completed on{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              .
            </Text>
            <Stack gap="sm" className={styles.actionButtons}>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={onStartWorkout}
              >
                Start Workout
              </Button>
              {onClearFilter && (
                <Button variant="subtle" onClick={onClearFilter}>
                  Show All Workouts
                </Button>
              )}
            </Stack>
          </Box>
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  return (
    <FitAiCard className={styles.emptyStateCard}>
      <FitAiCardContent>
        <Box className={styles.emptyContainer}>
          {/* Welcome icon */}
          <Box className={styles.iconWrapper}>
            <IconBarbell size={40} style={{ color: "var(--mantine-primary-color-filled)" }} />
          </Box>

          {/* Welcome message */}
          <Text className={styles.title}>Ready to start your fitness journey?</Text>
          <Text size="sm" c="dimmed" className={styles.description}>
            Track your workouts, monitor your progress, and achieve your fitness goals.
            Start your first workout now or choose from our templates.
          </Text>

          {/* Primary actions */}
          <Stack gap="sm" className={styles.actionButtons}>
            <Button
              size="md"
              leftSection={<IconPlus size={18} />}
              onClick={onStartWorkout}
            >
              Start New Workout
            </Button>
            <Button
              variant="light"
              size="md"
              leftSection={<IconTemplate size={18} />}
              onClick={onUseTemplate}
            >
              Use a Template
            </Button>
          </Stack>

          {/* Template suggestions */}
          <Box className={styles.templateSuggestions}>
            <Text size="sm" fw={500}>
              Quick start with a template
            </Text>
            <Box className={styles.templateGrid}>
              {templateOptions.map((template) => (
                <UnstyledButton
                  key={template.id}
                  className={styles.templateCard}
                  onClick={() => onSelectTemplate?.(template.id)}
                >
                  <Box className={styles.templateIcon}>
                    <template.icon size={20} />
                  </Box>
                  <Text className={styles.templateName}>{template.name}</Text>
                  <Text className={styles.templateDescription}>
                    {template.description}
                  </Text>
                </UnstyledButton>
              ))}
            </Box>
          </Box>

          {/* Tip for beginners */}
          <Box className={styles.tipCard}>
            <Box className={styles.tipHeader}>
              <IconBulb size={16} className={styles.tipIcon} />
              <Text size="sm" fw={500}>
                Pro tip for beginners
              </Text>
            </Box>
            <Text size="xs" c="dimmed">
              Start with 2-3 workouts per week and gradually increase as you build consistency.
              Focus on proper form over heavy weights to prevent injury and maximize results.
            </Text>
          </Box>
        </Box>
      </FitAiCardContent>
    </FitAiCard>
  );
}
