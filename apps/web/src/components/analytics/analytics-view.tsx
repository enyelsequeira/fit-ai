/**
 * AnalyticsView - Main analytics page component
 * Displays training analytics with tabs for Volume, Strength, and Consistency
 */

import type { DatesRangeValue } from "@mantine/dates";
import { IconChartBar, IconTarget, IconTrendingUp } from "@tabler/icons-react";
import { Box, Group, SegmentedControl, Stack, Tabs } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

import { ErrorState, PageHeader } from "@/components/ui/state-views";

import { SummaryStatsGrid } from "./summary-stats-grid";
import { VolumeTabContent, StrengthTabContent, ConsistencyTabContent } from "./tab-contents";
import { useAnalyticsData, type DateRangePeriod } from "./use-analytics-data";

import styles from "./analytics-view.module.css";

const PERIOD_OPTIONS = [
  { value: "week", label: "1W" },
  { value: "month", label: "1M" },
  { value: "3months", label: "3M" },
  { value: "year", label: "1Y" },
];

export function AnalyticsView() {
  const {
    activeTab,
    setActiveTab,
    period,
    setPeriod,
    customDateRange,
    setCustomDateRange,
    selectedExerciseId,
    setSelectedExerciseId,
    exercises,
    weeklySummary,
    volumeData,
    muscleVolumeData,
    strengthData,
    consistencyData,
    isLoading,
    isError,
    isStrengthLoading,
    refetch,
  } = useAnalyticsData();

  const handlePeriodChange = (value: string) => {
    setPeriod(value as DateRangePeriod);
    setCustomDateRange([null, null]);
  };

  const handleDateRangeChange = (value: DatesRangeValue) => {
    const [start, end] = value;
    setCustomDateRange([
      start instanceof Date ? start : start ? new Date(start) : null,
      end instanceof Date ? end : end ? new Date(end) : null,
    ]);
  };

  if (isError) {
    return (
      <Box
        p={{ base: "sm", md: "md" }}
        className={styles.analyticsContainer}
        data-view="analytics"
        data-state="error"
      >
        <Stack gap="md">
          <PageHeader
            title="Analytics"
            description="Detailed insights into your training progress"
          />
          <ErrorState
            title="Error loading analytics"
            message="Failed to load analytics data. Please try again."
            onRetry={refetch}
          />
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      p={{ base: "sm", md: "md" }}
      className={styles.analyticsContainer}
      data-view="analytics"
      data-state={isLoading ? "loading" : "ready"}
      data-active-tab={activeTab}
    >
      <Stack gap="md">
        <PageHeader
          title="Analytics"
          description="Detailed insights into your training progress"
          actions={
            <Group gap="sm" wrap="wrap">
              <SegmentedControl
                size="xs"
                value={period}
                onChange={handlePeriodChange}
                data={PERIOD_OPTIONS}
              />
              <DatePickerInput
                type="range"
                size="xs"
                placeholder="Custom range"
                value={customDateRange}
                onChange={handleDateRangeChange}
                clearable
                maxDate={new Date()}
                w={{ base: "100%", sm: 220 }}
              />
            </Group>
          }
        />

        <SummaryStatsGrid weeklySummary={weeklySummary} isLoading={isLoading} />

        <Tabs value={activeTab} onChange={(value) => setActiveTab(value as typeof activeTab)}>
          <Tabs.List>
            <Tabs.Tab value="volume" leftSection={<IconChartBar size={16} />}>
              Volume
            </Tabs.Tab>
            <Tabs.Tab value="strength" leftSection={<IconTrendingUp size={16} />}>
              Strength
            </Tabs.Tab>
            <Tabs.Tab value="consistency" leftSection={<IconTarget size={16} />}>
              Consistency
            </Tabs.Tab>
          </Tabs.List>

          <Box pt="md">
            <Tabs.Panel value="volume">
              <VolumeTabContent
                volumeData={volumeData}
                muscleVolumeData={muscleVolumeData}
                isLoading={isLoading}
              />
            </Tabs.Panel>

            <Tabs.Panel value="strength">
              <StrengthTabContent
                strengthData={strengthData}
                exercises={exercises}
                selectedExerciseId={selectedExerciseId}
                onExerciseSelect={setSelectedExerciseId}
                isLoading={isStrengthLoading}
              />
            </Tabs.Panel>

            <Tabs.Panel value="consistency">
              <ConsistencyTabContent consistencyData={consistencyData} isLoading={isLoading} />
            </Tabs.Panel>
          </Box>
        </Tabs>
      </Stack>
    </Box>
  );
}
