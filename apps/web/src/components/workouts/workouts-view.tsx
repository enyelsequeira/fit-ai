/**
 * WorkoutsView - Main workouts page component
 * Sidebar layout with time-based filters on left, workout list on right
 * Following the templates pattern structure
 */

import { useState } from "react";
import { Box, Text, Group, Button, Tooltip, Flex } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconBarbell } from "@tabler/icons-react";
import { WorkoutsSidebar } from "./components/workouts-sidebar/workouts-sidebar.tsx";
import { WorkoutList } from "./components/workout-list/workout-list.tsx";
import { WorkoutsHeader } from "./components/workouts-header/workouts-header.tsx";
import { CreateWorkoutModal } from "./components/create-workout-modal/create-workout-modal.tsx";
import { WorkoutDetailModal } from "./components/workout-detail-modal/workout-detail-modal.tsx";
import type { TimePeriodFilter } from "./types";
import { TIME_PERIOD_LABELS } from "./types";
import styles from "./workouts-view.module.css";

export function WorkoutsView() {
  // Local state
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriodFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [detailModalOpened, { open: openDetailModal, close: closeDetailModal }] =
    useDisclosure(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<number | null>(null);

  // Get current period label
  const currentPeriodLabel = TIME_PERIOD_LABELS[selectedPeriod];

  // Handler for workout card click
  const handleWorkoutClick = (workoutId: number) => {
    setSelectedWorkoutId(workoutId);
    openDetailModal();
  };

  return (
    <Flex className={styles.pageContainer}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Group gap="xs" align="center">
            <Tooltip label="Workouts">
              <Flex
                align="center"
                justify="center"
                w={36}
                h={36}
                style={{ borderRadius: "var(--mantine-radius-md)" }}
                c="white"
                className={styles.logoIcon}
              >
                <IconBarbell size={20} />
              </Flex>
            </Tooltip>
            <Text fw={600} size="lg">
              Workouts
            </Text>
          </Group>
        </div>

        <div className={styles.sidebarContent}>
          <WorkoutsSidebar
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
          />
        </div>

        <Box p="md" className={styles.sidebarFooter}>
          <Tooltip label="Start a new workout session">
            <Button
              fullWidth
              leftSection={<IconPlus size={16} />}
              onClick={openCreateModal}
              className={styles.createButton}
            >
              New Workout
            </Button>
          </Tooltip>
        </Box>
      </div>

      {/* Main Content */}
      <Flex direction="column" flex={1} miw={0}>
        <WorkoutsHeader
          currentPeriodLabel={currentPeriodLabel}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateWorkout={openCreateModal}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />

        {/* Content Area */}
        <div className={styles.contentArea}>
          <div className={styles.workoutsContainer}>
            <WorkoutList
              timePeriod={selectedPeriod}
              searchQuery={searchQuery}
              onWorkoutClick={handleWorkoutClick}
              onCreateWorkout={openCreateModal}
            />
          </div>
        </div>
      </Flex>

      {/* Modals */}
      <CreateWorkoutModal
        opened={createModalOpened}
        onClose={closeCreateModal}
      />

      <WorkoutDetailModal
        opened={detailModalOpened}
        onClose={closeDetailModal}
        workoutId={selectedWorkoutId}
      />
    </Flex>
  );
}
