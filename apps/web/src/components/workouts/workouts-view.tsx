import { useState } from "react";
import { Box, Group, Button, Flex, Stack, Container } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconBarbell } from "@tabler/icons-react";
import { WorkoutsSidebar } from "./components/workouts-sidebar/workouts-sidebar.tsx";
import { WorkoutList } from "./components/workout-list/workout-list.tsx";
import { WorkoutsHeader } from "./components/workouts-header/workouts-header.tsx";
import { CreateWorkoutModal } from "./components/create-workout-modal/create-workout-modal.tsx";
import { WorkoutDetailModal } from "./components/workout-detail-modal/workout-detail-modal.tsx";
import { ActiveTemplateCard } from "./components/active-template-card/index.ts";
import type { TimePeriodFilter } from "./types";
import { TIME_PERIOD_LABELS } from "./types";
import styles from "./workouts-view.module.css";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text.tsx";
import { FitAiContentArea } from "@/components/ui/fit-ai-content-area/fit-ai-content-area.tsx";

export function WorkoutsView() {
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
    <>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Group gap="xs" align="center">
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
            <FitAiText variant={"subheading"}>Workouts</FitAiText>
          </Group>
        </div>

        <div className={styles.sidebarContent}>
          <WorkoutsSidebar selectedPeriod={selectedPeriod} onSelectPeriod={setSelectedPeriod} />
        </div>

        <Box p="md" className={styles.sidebarFooter}>
          <Button
            fullWidth
            leftSection={<IconPlus size={16} />}
            onClick={openCreateModal}
            className={styles.createButton}
          >
            New Workout
          </Button>
        </Box>
      </div>

      {/* Main Content */}
      <Container fluid flex={1}>
        <WorkoutsHeader
          currentPeriodLabel={currentPeriodLabel}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateWorkout={openCreateModal}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />

        {/* Content Area */}
        <FitAiContentArea>
          <Stack gap="xl" className={styles.workoutsContainer}>
            {/* Active Template Section */}
            <section>
              <FitAiText.Heading mb={"md"}>Current Program</FitAiText.Heading>
              <ActiveTemplateCard />
            </section>

            {/* Recent Workouts Section */}
            <section>
              <FitAiText.Heading my={"sm"}>Recent Workouts</FitAiText.Heading>
              <WorkoutList
                timePeriod={selectedPeriod}
                searchQuery={searchQuery}
                onWorkoutClick={handleWorkoutClick}
                onCreateWorkout={openCreateModal}
              />
            </section>
          </Stack>
        </FitAiContentArea>
      </Container>

      {/* Modals */}
      <CreateWorkoutModal opened={createModalOpened} onClose={closeCreateModal} />

      <WorkoutDetailModal
        opened={detailModalOpened}
        onClose={closeDetailModal}
        workoutId={selectedWorkoutId}
      />
    </>
  );
}
