/**
 * RecordsView - Main personal records page component
 * Uses sidebar + FitAiPageHeader + FitAiContentArea layout
 */

import type { RecordTypeFilter } from "./types";

import { useCallback, useState } from "react";
import { Box, Container, Flex, Group, SegmentedControl, Stack, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useDebouncedValue } from "@mantine/hooks";
import { IconPlus, IconSearch, IconTrophy, IconX } from "@tabler/icons-react";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import { FitAiContentArea } from "@/components/ui/fit-ai-content-area/fit-ai-content-area";
import { FitAiPageHeader } from "@/components/ui/fit-ai-page-header/fit-ai-page-header";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import {
  useRecordsByExerciseGrouped,
  useRecordsList,
  useRecordsStats,
  useRecentRecords,
} from "./queries/use-queries";
import { AllTimePRsGrid } from "./all-time-prs-grid";
import { PRDetailModal } from "./pr-detail-modal";
import { RecentPRsList } from "./recent-prs-list";
import { RecordsSummary } from "./records-summary";
import styles from "./records-view.module.css";

const TYPE_OPTIONS: { value: RecordTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "one_rep_max", label: "1RM" },
  { value: "max_weight", label: "Weight" },
  { value: "max_reps", label: "Reps" },
  { value: "max_volume", label: "Volume" },
];

export function RecordsView() {
  // Filter state
  const [recordTypeFilter, setRecordTypeFilter] = useState<RecordTypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);

  // Selected record for modal
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  // Queries
  const listQuery = useRecordsList({
    recordType: recordTypeFilter === "all" ? undefined : recordTypeFilter,
  });
  const recentQuery = useRecentRecords();
  const stats = useRecordsStats();

  // Derived data
  const allRecords = listQuery.data?.records ?? [];
  const recordsByExercise = useRecordsByExerciseGrouped(allRecords);

  // Filter records by exercise name
  const filteredRecordsByExercise = debouncedSearchQuery.trim()
    ? recordsByExercise.filter((g) =>
        g.exerciseName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
      )
    : recordsByExercise;

  const handleRecordClick = useCallback(
    (recordId: number) => {
      setSelectedRecordId(recordId);
      openModal();
    },
    [openModal],
  );

  const handleExerciseClick = useCallback(
    (exerciseId: number) => {
      const group = filteredRecordsByExercise.find((g) => g.exerciseId === exerciseId);
      const firstRecord = group?.records[0];
      if (firstRecord) {
        handleRecordClick(firstRecord.id);
      }
    },
    [filteredRecordsByExercise, handleRecordClick],
  );

  const handleCloseModal = useCallback(() => {
    closeModal();
    setSelectedRecordId(null);
  }, [closeModal]);

  const hasActiveFilters = searchQuery.trim() !== "" || recordTypeFilter !== "all";

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
              c="white"
              className={styles.logoIcon}
              style={{ borderRadius: "var(--mantine-radius-md)" }}
            >
              <IconTrophy size={20} />
            </Flex>
            <FitAiText variant="subheading">Records</FitAiText>
          </Group>
        </div>

        <div className={styles.sidebarContent}>
          <Stack gap="md">
            <TextInput
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftSection={<IconSearch size={16} />}
              rightSection={
                searchQuery ? (
                  <Box
                    component="button"
                    onClick={() => setSearchQuery("")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                    }}
                  >
                    <IconX size={14} />
                  </Box>
                ) : null
              }
              size="sm"
            />
            <Box>
              <FitAiText variant="label" mb="xs">
                Record Type
              </FitAiText>
              <SegmentedControl
                value={recordTypeFilter}
                onChange={(value) => setRecordTypeFilter(value as RecordTypeFilter)}
                data={TYPE_OPTIONS}
                size="xs"
                fullWidth
                orientation="vertical"
              />
            </Box>
            {hasActiveFilters && (
              <FitAiButton
                variant="secondary"
                size="xs"
                fullWidth
                leftSection={<IconX size={14} />}
                onClick={() => {
                  setSearchQuery("");
                  setRecordTypeFilter("all");
                }}
              >
                Clear Filters
              </FitAiButton>
            )}
          </Stack>
        </div>

        <Box p="md" className={styles.sidebarFooter}>
          <FitAiButton
            variant="primary"
            fullWidth
            leftSection={<IconPlus size={16} />}
            className={styles.createButton}
          >
            Log Record
          </FitAiButton>
        </Box>
      </div>

      {/* Main Content */}
      <Container fluid flex={1}>
        <FitAiPageHeader>
          <FitAiPageHeader.Title>Personal Records</FitAiPageHeader.Title>
          <FitAiPageHeader.Description>
            Track your personal bests and celebrate your achievements
          </FitAiPageHeader.Description>
          <FitAiPageHeader.Stats>
            <RecordsSummary stats={stats} />
          </FitAiPageHeader.Stats>
        </FitAiPageHeader>

        <FitAiContentArea>
          <div className={styles.contentGrid}>
            <Stack gap="md">
              <RecentPRsList
                records={recentQuery.data ?? []}
                isLoading={recentQuery.isLoading}
                onRecordClick={handleRecordClick}
              />
            </Stack>

            <Stack gap="md">
              <AllTimePRsGrid
                recordsByExercise={filteredRecordsByExercise}
                isLoading={listQuery.isLoading}
                onExerciseClick={handleExerciseClick}
                onRecordClick={handleRecordClick}
              />
            </Stack>
          </div>
        </FitAiContentArea>
      </Container>

      {/* Detail Modal */}
      <PRDetailModal recordId={selectedRecordId} opened={modalOpened} onClose={handleCloseModal} />
    </>
  );
}
