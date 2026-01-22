import { useState } from "react";
import {
  Paper,
  Stack,
  Group,
  Text,
  Skeleton,
  ThemeIcon,
  Badge,
  Modal,
  SimpleGrid,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconTemplate,
  IconPlayerPlay,
  IconCalendar,
  IconBarbell,
  IconClock,
  IconArrowRight,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  activeTemplateOptions,
  templateDetailOptions,
} from "../../../templates/queries/query-options";
import { useStartWorkoutFromTemplate } from "../../hooks/use-mutations";
import styles from "./active-template-card.module.css";
import { FitAiToolTip } from "@/components/ui/fit-ai-tooltip/fit-ai-tool-tip.tsx";
import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button.tsx";

export function ActiveTemplateCard() {
  const navigate = useNavigate();

  // Fetch active template settings
  const activeTemplateQuery = useQuery(activeTemplateOptions());

  // Extract template ID from settings
  const activeTemplateId = activeTemplateQuery.data?.activeTemplateId ?? null;

  // Fetch template details if we have an active template
  const templateQuery = useQuery({
    ...templateDetailOptions(activeTemplateId),
    enabled: activeTemplateId !== null,
  });

  // Day selection modal state
  const [dayModalOpened, { open: openDayModal, close: closeDayModal }] = useDisclosure(false);
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);

  // Start workout mutation
  const startWorkoutMutation = useStartWorkoutFromTemplate();

  // Loading state
  if (activeTemplateQuery.isLoading) {
    return <ActiveTemplateCardSkeleton />;
  }

  // Error state for active template query
  if (activeTemplateQuery.isError) {
    return (
      <Paper className={styles.card} data-state="error">
        <Stack align="center" gap="md" py="xl">
          <ThemeIcon size={48} radius="xl" color="red" variant="light">
            <IconAlertCircle size={24} />
          </ThemeIcon>
          <Text c="dimmed" ta="center">
            Failed to load active template settings.
          </Text>
          <FitAiButton variant="outline" onClick={() => activeTemplateQuery.refetch()}>
            Try Again
          </FitAiButton>
        </Stack>
      </Paper>
    );
  }

  // No active template state
  if (!activeTemplateId) {
    return (
      <Paper className={styles.card} data-state="empty">
        <Stack align="center" gap="md" py="xl">
          <ThemeIcon size={56} radius="xl" color="gray" variant="light">
            <IconTemplate size={28} />
          </ThemeIcon>
          <Stack gap={4} align="center">
            <Text size="lg" fw={600}>
              No Active Program
            </Text>
            <Text c="dimmed" ta="center" maw={400}>
              Set a workout template as your active program to quickly start workouts from here.
            </Text>
          </Stack>
          <FitAiButton
            component={Link}
            to="/dashboard/templates"
            variant="outline"
            rightSection={<IconArrowRight size={16} />}
          >
            Browse Templates
          </FitAiButton>
        </Stack>
      </Paper>
    );
  }

  // Loading template details
  if (templateQuery.isLoading) {
    return <ActiveTemplateCardSkeleton />;
  }

  // Template not found or error
  if (templateQuery.isError || !templateQuery.data) {
    return (
      <Paper className={styles.card} data-state="error">
        <Stack align="center" gap="md" py="xl">
          <ThemeIcon size={48} radius="xl" color="orange" variant="light">
            <IconAlertCircle size={24} />
          </ThemeIcon>
          <Text c="dimmed" ta="center">
            Could not load template details. The template may have been deleted.
          </Text>
          <FitAiButton component={Link} to="/dashboard/templates" variant="outline">
            Choose New Template
          </FitAiButton>
        </Stack>
      </Paper>
    );
  }

  const template = templateQuery.data;
  const days = template.days ?? [];
  const hasMultipleDays = days.length > 1;
  const totalExercises = days.reduce((sum, day) => sum + (day.exercises?.length ?? 0), 0);

  const handleStartWorkout = (dayId?: number) => {
    const targetDayId = dayId ?? days[0]?.id;

    if (!targetDayId) {
      // No days available, create empty workout
      startWorkoutMutation.mutate(
        { id: template.id },
        {
          onSuccess: (workout) => {
            navigate({ to: `/dashboard/workouts/${workout.id}` as string });
          },
        },
      );
      return;
    }

    startWorkoutMutation.mutate(
      { id: template.id, dayId: targetDayId },
      {
        onSuccess: (workout) => {
          closeDayModal();
          navigate({ to: `/dashboard/workouts/${workout.id}` as string });
        },
      },
    );
  };

  const handleStartClick = () => {
    if (hasMultipleDays) {
      openDayModal();
    } else {
      handleStartWorkout();
    }
  };

  return (
    <>
      <Paper className={styles.card} data-state="active">
        {/* Accent bar */}
        <div className={styles.accentBar} aria-hidden="true" />

        <div className={styles.content}>
          {/* Header */}
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Group gap="md" align="flex-start" wrap="nowrap">
              <ThemeIcon size={52} radius="md" className={styles.iconWrapper}>
                <IconTemplate size={26} />
              </ThemeIcon>
              <Stack gap={4}>
                <Group gap="xs">
                  <Badge size="xs" variant="light" color="teal" className={styles.badge}>
                    Active Program
                  </Badge>
                </Group>
                <Text size="xl" fw={700} className={styles.templateName}>
                  {template.name}
                </Text>
                {template.description && (
                  <Text size="sm" c="dimmed" lineClamp={2}>
                    {template.description}
                  </Text>
                )}
              </Stack>
            </Group>
          </Group>

          {/* Stats */}
          <Group gap="xl" mt="md" className={styles.stats}>
            <FitAiToolTip
              toolTipProps={{
                label: "Workout days in this program",
              }}
            >
              <Group gap="xs" className={styles.statItem}>
                <IconCalendar size={18} className={styles.statIcon} />
                <Text size="sm" fw={500}>
                  {days.length} {days.length === 1 ? "day" : "days"}
                </Text>
              </Group>
            </FitAiToolTip>

            <FitAiToolTip
              toolTipProps={{
                label: "Total exercises across all days",
              }}
            >
              <Group gap="xs" className={styles.statItem}>
                <IconBarbell size={18} className={styles.statIcon} />
                <Text size="sm" fw={500}>
                  {totalExercises} {totalExercises === 1 ? "exercise" : "exercises"}
                </Text>
              </Group>
            </FitAiToolTip>

            {template.estimatedDurationMinutes && (
              <FitAiToolTip
                toolTipProps={{
                  label: "Estimated workout duration",
                }}
              >
                <Group gap="xs" className={styles.statItem}>
                  <IconClock size={18} className={styles.statIcon} />
                  <Text size="sm" fw={500}>
                    ~{template.estimatedDurationMinutes} min
                  </Text>
                </Group>
              </FitAiToolTip>
            )}
          </Group>

          {/* Actions */}
          <Group gap="md" mt="lg">
            <FitAiButton
              variant={"outline"}
              leftSection={<IconPlayerPlay size={18} />}
              onClick={handleStartClick}
              loading={startWorkoutMutation.isPending}
            >
              {hasMultipleDays ? "Start Workout" : "Start Today's Workout"}
            </FitAiButton>
            <FitAiButton component={Link} to="/dashboard/templates" variant="secondary" size="md">
              Change Program
            </FitAiButton>
          </Group>
        </div>
      </Paper>

      {/* Day Selection Modal for multi-day templates */}
      <Modal
        opened={dayModalOpened}
        onClose={closeDayModal}
        title="Choose Workout Day"
        centered
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Select which day of your program you want to start:
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {days.map((day, index) => (
              <UnstyledButton
                key={day.id}
                className={`${styles.dayOption} ${selectedDayId === day.id ? styles.dayOptionSelected : ""}`}
                onClick={() => setSelectedDayId(day.id)}
              >
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon
                    size={40}
                    radius="md"
                    variant={selectedDayId === day.id ? "filled" : "light"}
                    color={day.isRestDay ? "gray" : "teal"}
                  >
                    {day.isRestDay ? (
                      <IconClock size={20} />
                    ) : (
                      <Text size="sm" fw={600}>
                        {index + 1}
                      </Text>
                    )}
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Text size="sm" fw={600} lineClamp={1}>
                      {day.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {day.isRestDay ? "Rest Day" : `${day.exercises?.length ?? 0} exercises`}
                    </Text>
                  </Stack>
                </Group>
              </UnstyledButton>
            ))}
          </SimpleGrid>
          <Group justify="flex-end" mt="md">
            <FitAiButton variant="danger" onClick={closeDayModal}>
              Cancel
            </FitAiButton>
            <FitAiButton
              variant={"primary"}
              onClick={() => handleStartWorkout(selectedDayId ?? undefined)}
              loading={startWorkoutMutation.isPending}
              disabled={!selectedDayId}
              leftSection={<IconPlayerPlay size={16} />}
            >
              Start Workout
            </FitAiButton>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

/**
 * Skeleton loader for ActiveTemplateCard
 */
export function ActiveTemplateCardSkeleton() {
  return (
    <Paper className={styles.card} data-state="loading">
      <div className={styles.content}>
        <Group gap="md" align="flex-start" wrap="nowrap">
          <Skeleton height={52} width={52} radius="md" />
          <Stack gap={8} style={{ flex: 1 }}>
            <Skeleton height={16} width={100} radius="sm" />
            <Skeleton height={24} width="60%" radius="sm" />
            <Skeleton height={16} width="80%" radius="sm" />
          </Stack>
        </Group>
        <Group gap="xl" mt="md">
          <Skeleton height={20} width={80} radius="sm" />
          <Skeleton height={20} width={100} radius="sm" />
          <Skeleton height={20} width={70} radius="sm" />
        </Group>
        <Group gap="md" mt="lg">
          <Skeleton height={42} width={180} radius="md" />
          <Skeleton height={42} width={140} radius="md" />
        </Group>
      </div>
    </Paper>
  );
}
