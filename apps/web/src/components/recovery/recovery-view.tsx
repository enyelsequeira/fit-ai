import type { CheckInFormData, TrendPeriod } from "./types";

import { useCallback, useState } from "react";
import { Box, Container, Flex, Group, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHeartbeat, IconPlus, IconRefresh } from "@tabler/icons-react";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import { FitAiContentArea } from "@/components/ui/fit-ai-content-area/fit-ai-content-area";
import { FitAiPageHeader } from "@/components/ui/fit-ai-page-header/fit-ai-page-header";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import { useCreateCheckIn, useRefreshRecovery } from "./hooks/use-mutations";
import {
  useCheckInHistory,
  useReadiness,
  useRecoveryStats,
  useRecoveryStatus,
  useTodayCheckIn,
  useTrends,
} from "./queries/use-queries";
import { CheckInForm } from "./check-in-form";
import { CheckInSummary } from "./check-in-summary";
import { CheckInHistory } from "./check-in-history";
import { MuscleRecoveryMap } from "./muscle-recovery-map";
import { ReadinessScoreCard } from "./readiness-score-card";
import { RecoverySummary } from "./recovery-summary";
import { RecoveryTrendsChart } from "./recovery-trends-chart";
import styles from "./recovery-view.module.css";

export function RecoveryView() {
  // Data queries
  const todayCheckInQuery = useTodayCheckIn();
  const readinessQuery = useReadiness();
  const stats = useRecoveryStats();
  const recoveryStatusQuery = useRecoveryStatus();
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>("month");
  const trendsQuery = useTrends(trendPeriod);
  const [historyOffset, setHistoryOffset] = useState(0);
  const historyQuery = useCheckInHistory({ limit: 10, offset: historyOffset });

  // Mutations
  const createCheckInMutation = useCreateCheckIn();
  const refreshRecoveryMutation = useRefreshRecovery();

  // Modal state
  const [checkInModalOpened, { open: openCheckInModal, close: closeCheckInModal }] =
    useDisclosure(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleStartCheckIn = useCallback(() => {
    setIsEditMode(false);
    openCheckInModal();
  }, [openCheckInModal]);

  const handleEditCheckIn = useCallback(() => {
    setIsEditMode(true);
    openCheckInModal();
  }, [openCheckInModal]);

  const handleSubmitCheckIn = useCallback(
    async (data: CheckInFormData) => {
      await createCheckInMutation.mutateAsync(
        data as unknown as Parameters<typeof createCheckInMutation.mutateAsync>[0],
      );
      closeCheckInModal();
    },
    [createCheckInMutation, closeCheckInModal],
  );

  const handleRefreshRecovery = useCallback(async () => {
    await refreshRecoveryMutation.mutateAsync({});
  }, [refreshRecoveryMutation]);

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
              <IconHeartbeat size={20} />
            </Flex>
            <FitAiText variant="subheading">Recovery</FitAiText>
          </Group>
        </div>

        <div className={styles.sidebarContent} />

        <Box p="md" className={styles.sidebarFooter}>
          <FitAiButton
            variant="primary"
            fullWidth
            leftSection={<IconPlus size={16} />}
            onClick={handleStartCheckIn}
            className={styles.createButton}
          >
            Log Check-in
          </FitAiButton>
        </Box>
      </div>

      {/* Main Content */}
      <Container fluid flex={1}>
        <FitAiPageHeader>
          <FitAiPageHeader.Title>Recovery &amp; Check-ins</FitAiPageHeader.Title>
          <FitAiPageHeader.Description>
            Track your daily wellness and monitor muscle recovery
          </FitAiPageHeader.Description>
          <FitAiPageHeader.Actions>
            <FitAiPageHeader.Action
              variant="secondary"
              icon={<IconRefresh size={16} />}
              onClick={handleRefreshRecovery}
            >
              Refresh
            </FitAiPageHeader.Action>
            <FitAiPageHeader.Action
              variant="primary"
              icon={<IconPlus size={16} />}
              onClick={handleStartCheckIn}
            >
              Log Check-in
            </FitAiPageHeader.Action>
          </FitAiPageHeader.Actions>
          <FitAiPageHeader.Stats>
            <RecoverySummary stats={stats} />
          </FitAiPageHeader.Stats>
        </FitAiPageHeader>

        <FitAiContentArea>
          <div className={styles.contentGrid}>
            <Stack gap="md">
              <ReadinessScoreCard
                readiness={readinessQuery.data ?? null}
                isLoading={readinessQuery.isLoading}
              />
              <CheckInSummary
                checkIn={todayCheckInQuery.data ?? null}
                isLoading={todayCheckInQuery.isLoading}
                onEdit={handleEditCheckIn}
                onCreateNew={handleStartCheckIn}
              />
              <MuscleRecoveryMap
                muscleGroups={recoveryStatusQuery.data?.muscleGroups ?? []}
                overallRecovery={recoveryStatusQuery.data?.overallRecovery}
                isLoading={recoveryStatusQuery.isLoading}
              />
            </Stack>

            <Stack gap="md">
              <RecoveryTrendsChart
                trends={trendsQuery.data ?? null}
                period={trendPeriod}
                onPeriodChange={setTrendPeriod}
                isLoading={trendsQuery.isLoading}
              />
              <CheckInHistory
                checkIns={historyQuery.data?.checkIns ?? []}
                hasMore={(historyQuery.data?.total ?? 0) > historyOffset + 10}
                isLoading={historyQuery.isLoading}
                onLoadMore={() => setHistoryOffset((prev) => prev + 10)}
              />
            </Stack>
          </div>
        </FitAiContentArea>
      </Container>

      {/* Check-in Form Modal */}
      <Modal
        opened={checkInModalOpened}
        onClose={closeCheckInModal}
        title={isEditMode ? "Edit Today's Check-in" : "Daily Check-in"}
        size="lg"
        centered
      >
        <CheckInForm
          initialData={isEditMode ? (todayCheckInQuery.data as CheckInFormData | undefined) : null}
          onSubmit={handleSubmitCheckIn}
          isLoading={createCheckInMutation.isPending}
        />
      </Modal>
    </>
  );
}
