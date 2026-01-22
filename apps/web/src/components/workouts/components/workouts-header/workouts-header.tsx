import { useCallback } from "react";

import { Alert, Group, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertTriangle, IconCalendar, IconPlus, IconTrash } from "@tabler/icons-react";

import { FitAiPageHeader } from "@/components/ui/fit-ai-page-header/fit-ai-page-header";

import { useCancelAllActiveWorkouts } from "../../hooks/use-mutations";
import { useWorkoutsList } from "../../queries/use-queries";
import type { TimePeriodFilter } from "../../types";
import { TIME_PERIOD_LABELS } from "../../types";
import { WorkoutsStatsRow } from "../workouts-stats-row/workouts-stats-row";
import { FitAiToolTip } from "@/components/ui/fit-ai-tooltip/fit-ai-tool-tip.tsx";
import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button.tsx";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text.tsx";

type WorkoutsHeaderProps = {
  currentPeriodLabel: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateWorkout: () => void;
  /** Currently selected time period */
  selectedPeriod?: TimePeriodFilter;
  /** Callback when time period changes (for mobile) */
  onPeriodChange?: (period: TimePeriodFilter) => void;
};

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
      <FitAiPageHeader>
        <FitAiPageHeader.Title>{currentPeriodLabel}</FitAiPageHeader.Title>
        <FitAiPageHeader.Description>
          Track your training sessions and monitor your progress
        </FitAiPageHeader.Description>

        <FitAiPageHeader.Actions>
          {hasActiveWorkouts && (
            <FitAiToolTip
              toolTipProps={{
                label: `Cancel ${activeWorkouts.length} active workout${activeWorkouts.length > 1 ? "s" : ""}`,
              }}
            >
              <FitAiButton
                leftSection={<IconTrash size={16} />}
                onClick={openCancelModal}
                variant="danger"
              >
                Cancel All ({activeWorkouts.length})
              </FitAiButton>
            </FitAiToolTip>
          )}
          <FitAiPageHeader.Action
            variant="primary"
            icon={<IconPlus size={16} />}
            onClick={onCreateWorkout}
            tooltip="Start a new workout session"
          >
            New Workout
          </FitAiPageHeader.Action>
        </FitAiPageHeader.Actions>

        <FitAiPageHeader.Stats>
          <WorkoutsStatsRow stats={stats} isLoading={isLoading} />
        </FitAiPageHeader.Stats>

        <FitAiPageHeader.SearchRow>
          {onPeriodChange && (
            <FitAiPageHeader.MobileFilter
              value={selectedPeriod ?? null}
              onChange={(value) => {
                if (value) {
                  onPeriodChange(value as TimePeriodFilter);
                }
              }}
              options={periodOptions}
              placeholder="Select time period"
              icon={<IconCalendar size={16} />}
            />
          )}
          <FitAiPageHeader.Search
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search workouts..."
          />
        </FitAiPageHeader.SearchRow>
      </FitAiPageHeader>

      {/* Cancel All Active Workouts Confirmation Modal */}
      <Modal
        opened={cancelModalOpened}
        onClose={closeCancelModal}
        title={
          <Group gap="xs">
            <IconAlertTriangle size={20} color="var(--mantine-color-red-6)" />
            <FitAiText variant={"body"}>Cancel All Active Workouts</FitAiText>
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
          <FitAiText variant={"muted"}>
            You are about to permanently delete {activeWorkouts.length} active workout
            {activeWorkouts.length > 1 ? "s" : ""}. All progress will be lost.
          </FitAiText>
        </Alert>

        <Group justify="flex-end" gap="sm">
          <FitAiButton variant="ghost" onClick={closeCancelModal}>
            Keep Workouts
          </FitAiButton>
          <FitAiButton
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={handleCancelAll}
            loading={cancelAllMutation.isPending}
          >
            Cancel All
          </FitAiButton>
        </Group>
      </Modal>
    </>
  );
}
