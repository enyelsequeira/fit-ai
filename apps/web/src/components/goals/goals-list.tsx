/**
 * GoalsList - List of goals with tabs for filtering by status
 */

import type { GoalStatus, GoalWithExercise, StatusTab } from "./types";

import { Box, Button, Stack, Tabs, Text } from "@mantine/core";
import { IconPlus, IconTarget } from "@tabler/icons-react";
import { EmptyState, ErrorState } from "@/components/ui/state-views";
import { GoalCard, GoalCardSkeleton } from "./goal-card";

export interface GoalTabsState {
  statusTabs: StatusTab[];
  activeTab: GoalStatus | "all";
  onTabChange: (tab: GoalStatus | "all") => void;
}

export interface GoalLoadingState {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export interface GoalListActions {
  onGoalClick: (goal: GoalWithExercise) => void;
  onLogProgress: (goal: GoalWithExercise) => void;
  onComplete: (goal: GoalWithExercise) => void;
  onPause: (goal: GoalWithExercise) => void;
  onResume: (goal: GoalWithExercise) => void;
  onAbandon: (goal: GoalWithExercise) => void;
  onDelete: (goal: GoalWithExercise) => void;
  onCreateGoal: () => void;
}

interface GoalsListProps {
  goals: GoalWithExercise[];
  tabs: GoalTabsState;
  loadingState: GoalLoadingState;
  actions: GoalListActions;
}

function GoalsEmptyState({
  activeTab,
  onCreateGoal,
}: {
  activeTab: GoalStatus | "all";
  onCreateGoal: () => void;
}) {
  const getEmptyMessage = () => {
    switch (activeTab) {
      case "active":
        return "You don't have any active goals. Create one to start tracking your progress.";
      case "paused":
        return "No paused goals. Paused goals will appear here when you temporarily stop tracking them.";
      case "completed":
        return "No completed goals yet. Keep working on your active goals to achieve them.";
      case "abandoned":
        return "No abandoned goals. Goals you give up on will appear here.";
      default:
        return "You haven't created any goals yet. Set your first goal to start your fitness journey.";
    }
  };

  const title = activeTab === "all" ? "No goals yet" : `No ${activeTab} goals`;
  const showAction = activeTab === "all" || activeTab === "active";

  return (
    <EmptyState
      icon={<IconTarget size={48} stroke={1.5} />}
      title={title}
      message={getEmptyMessage()}
      action={
        showAction ? (
          <Button leftSection={<IconPlus size={16} />} onClick={onCreateGoal}>
            Create Your First Goal
          </Button>
        ) : undefined
      }
    />
  );
}

function LoadingState() {
  return (
    <Stack gap="sm">
      {[0, 1, 2].map((i) => (
        <GoalCardSkeleton key={i} />
      ))}
    </Stack>
  );
}

export function GoalsList({ goals, tabs, loadingState, actions }: GoalsListProps) {
  const { statusTabs, activeTab, onTabChange } = tabs;
  const { isLoading, isError, onRetry } = loadingState;
  const {
    onGoalClick,
    onLogProgress,
    onComplete,
    onPause,
    onResume,
    onAbandon,
    onDelete,
    onCreateGoal,
  } = actions;
  return (
    <Box>
      {/* Status Tabs */}
      <Tabs
        value={activeTab}
        onChange={(value) => {
          if (value) onTabChange(value as GoalStatus | "all");
        }}
        mb="md"
      >
        <Tabs.List>
          {statusTabs.map((tab) => (
            <Tabs.Tab
              key={tab.value}
              value={tab.value}
              rightSection={
                tab.count !== undefined ? (
                  <Text size="xs" c="dimmed" span>
                    ({tab.count})
                  </Text>
                ) : null
              }
            >
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      {/* Content */}
      {isError ? (
        <ErrorState
          title="Failed to load goals"
          message="There was an error loading your goals. Please try again."
          onRetry={onRetry}
        />
      ) : isLoading ? (
        <LoadingState />
      ) : goals.length === 0 ? (
        <GoalsEmptyState activeTab={activeTab} onCreateGoal={onCreateGoal} />
      ) : (
        <Stack gap="sm">
          {goals.map((goal, index) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={onGoalClick}
              onLogProgress={onLogProgress}
              onComplete={onComplete}
              onPause={onPause}
              onResume={onResume}
              onAbandon={onAbandon}
              onDelete={onDelete}
              animationDelay={index * 50}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
