/**
 * WorkoutsHeader - Header section for workouts page
 * Shows title, search, time period selector (mobile), and action buttons
 */

import { useCallback } from "react";
import {
  TextInput,
  Button,
  Text,
  Tooltip,
  Select,
  Box,
  Flex,
  Title,
  Modal,
  Group,
  Alert,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconSearch,
  IconPlus,
  IconCalendar,
  IconTrash,
  IconAlertTriangle,
} from "@tabler/icons-react";
import type { TimePeriodFilter } from "../../types";
import { TIME_PERIOD_LABELS } from "../../types";
import { useWorkoutsList } from "../../queries/use-queries.ts";
import { useCancelAllActiveWorkouts } from "../../hooks/use-mutations.ts";
import { WorkoutsStatsRow } from "../workouts-stats-row/workouts-stats-row.tsx";
import styles from "./workouts-header.module.css";

interface WorkoutsHeaderProps {
  currentPeriodLabel: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateWorkout: () => void;
  /** Currently selected time period */
  selectedPeriod?: TimePeriodFilter;
  /** Callback when time period changes (for mobile) */
  onPeriodChange?: (period: TimePeriodFilter) => void;
}

export function WorkoutsHeader({
  currentPeriodLabel,
  searchQuery,
  onSearchChange,
  onCreateWorkout,
  selectedPeriod,
  onPeriodChange,
}: WorkoutsHeaderProps) {
  const { data: workoutsData, isLoading } = useWorkoutsList();
  const workouts = workoutsData?.workouts ?? [];
  const cancelAllMutation = useCancelAllActiveWorkouts();
  const [cancelModalOpened, { open: openCancelModal, close: closeCancelModal }] =
    useDisclosure(false);

  // Get active (in-progress) workouts
  const activeWorkouts = workouts.filter((w) => w.completedAt === null);
  const hasActiveWorkouts = activeWorkouts.length > 0;

  // Handle cancel all active workouts
  const handleCancelAll = useCallback(() => {
    const activeIds = activeWorkouts.map((w) => w.id);
    cancelAllMutation.mutate(activeIds, {
      onSuccess: () => {
        closeCancelModal();
      },
    });
  }, [activeWorkouts, cancelAllMutation, closeCancelModal]);

  // Build period options for mobile Select
  const periodOptions = Object.entries(TIME_PERIOD_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  // Calculate stats
  const stats = {
    totalWorkouts: workouts.length,
    completedWorkouts: workouts.filter((w) => w.completedAt !== null).length,
    inProgressWorkouts: workouts.filter((w) => w.completedAt === null).length,
    thisWeekCount: workouts.filter((w) => {
      const workoutDate = new Date(w.startedAt);
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return workoutDate >= weekStart;
    }).length,
    isLoading,
  };

  return (
    <>
      <Box className={styles.header}>
        <Flex justify="space-between" align="flex-start" gap="lg" wrap="wrap" mb="lg">
          <Flex flex={1} direction="column" miw={200}>
            <Title order={2} m={0} className={styles.pageTitle}>
              {currentPeriodLabel}
            </Title>
            <Text c="dimmed" size="sm" mt={2}>
              Track your training sessions and monitor your progress
            </Text>
          </Flex>

          <Flex gap="sm" className={styles.headerActions}>
            {hasActiveWorkouts && (
              <Tooltip
                label={`Cancel ${activeWorkouts.length} active workout${activeWorkouts.length > 1 ? "s" : ""}`}
              >
                <Button
                  leftSection={<IconTrash size={16} />}
                  onClick={openCancelModal}
                  color="red"
                  variant="light"
                >
                  Cancel All ({activeWorkouts.length})
                </Button>
              </Tooltip>
            )}
            <Tooltip label="Start a new workout session">
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={onCreateWorkout}
                className={styles.primaryButton}
              >
                New Workout
              </Button>
            </Tooltip>
          </Flex>
        </Flex>

        <WorkoutsStatsRow stats={stats} isLoading={isLoading} />

        <Flex
          gap="md"
          align={{ base: "center", lg: "stretch" }}
          direction={{ base: "column", lg: "row" }}
        >
          {/* Mobile time period selector - hidden on desktop where sidebar is visible */}
          {onPeriodChange && (
            <Box hiddenFrom="lg" className={styles.mobilePeriodSelect}>
              <Select
                placeholder="Select time period"
                leftSection={<IconCalendar size={16} />}
                data={periodOptions}
                value={selectedPeriod}
                onChange={(value) => {
                  if (value) {
                    onPeriodChange(value as TimePeriodFilter);
                  }
                }}
                size="md"
                comboboxProps={{ withinPortal: true }}
              />
            </Box>
          )}
          <TextInput
            id="workout-search"
            placeholder="Search workouts..."
            leftSection={<IconSearch size={18} />}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
            size="md"
            className={styles.searchWrapper}
          />
        </Flex>
      </Box>

      {/* Cancel All Active Workouts Confirmation Modal */}
      <Modal
        opened={cancelModalOpened}
        onClose={closeCancelModal}
        title={
          <Group gap="xs">
            <IconAlertTriangle size={20} color="var(--mantine-color-red-6)" />
            <Text fw={600}>Cancel All Active Workouts</Text>
          </Group>
        }
        size="sm"
      >
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="This action cannot be undone"
          color="red"
          variant="light"
          mb="lg"
        >
          <Text size="sm">
            You are about to permanently delete {activeWorkouts.length} active workout
            {activeWorkouts.length > 1 ? "s" : ""}. All progress will be lost.
          </Text>
        </Alert>

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={closeCancelModal}>
            Keep Workouts
          </Button>
          <Button
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={handleCancelAll}
            loading={cancelAllMutation.isPending}
          >
            Cancel All
          </Button>
        </Group>
      </Modal>
    </>
  );
}
