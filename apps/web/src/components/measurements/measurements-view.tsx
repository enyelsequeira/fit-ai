/**
 * MeasurementsView - Main body measurements page component
 * Displays summary stats, trend charts, and measurement history
 */

import { useCallback, useState } from "react";
import { Box, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { ErrorState, PageHeader } from "@/components/ui/state-views";
import { MeasurementsSummary } from "./measurements-summary";
import { WeightTrendChart } from "./weight-trend-chart";
import { MeasurementsHistory } from "./measurements-history";
import { LogMeasurementModal } from "./log-measurement-modal";
import type { MeasurementFormValues } from "./log-measurement-modal";
import { useMeasurementsData } from "./use-measurements-data";
import styles from "./measurements-view.module.css";

export function MeasurementsView() {
  const {
    summary,
    chartData,
    historyData,
    period,
    setPeriod,
    isLoading,
    isError,
    refetch,
    createMeasurement,
    updateMeasurement,
    deleteMeasurement,
    isCreating,
    isUpdating,
  } = useMeasurementsData();

  // Modal state using useDisclosure
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editInitialValues, setEditInitialValues] = useState<
    Partial<MeasurementFormValues> | undefined
  >(undefined);

  // Handle log measurement
  const handleLogMeasurement = useCallback(() => {
    setEditingId(null);
    setEditInitialValues(undefined);
    openModal();
  }, [openModal]);

  // Handle edit measurement
  const handleEdit = useCallback(
    (id: number) => {
      const measurement = historyData.find((m) => m.id === id);
      if (measurement) {
        setEditingId(id);
        setEditInitialValues({
          measuredAt: measurement.date,
          weight: measurement.weight,
          weightUnit: (measurement.weightUnit as "kg" | "lb") ?? "kg",
          bodyFatPercentage: measurement.bodyFatPercentage,
          chest: measurement.chest,
          waist: measurement.waist,
          hips: measurement.hips,
          leftArm: measurement.leftArm,
          rightArm: measurement.rightArm,
          leftThigh: measurement.leftThigh,
          rightThigh: measurement.rightThigh,
          notes: measurement.notes ?? "",
        });
        openModal();
      }
    },
    [historyData, openModal],
  );

  // Handle delete measurement
  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteMeasurement({ id });
        notifications.show({
          title: "Measurement deleted",
          message: "The measurement has been removed.",
          color: "green",
        });
      } catch {
        notifications.show({
          title: "Error",
          message: "Failed to delete measurement. Please try again.",
          color: "red",
        });
      }
    },
    [deleteMeasurement],
  );

  // Handle form submit
  const handleSubmit = useCallback(
    async (values: MeasurementFormValues) => {
      try {
        // Build the measurement data, filtering out null values
        const measurementData: Record<string, unknown> = {
          measuredAt: values.measuredAt,
          weightUnit: values.weightUnit,
          lengthUnit: values.lengthUnit,
        };

        // Only include non-null values
        if (values.weight !== null) measurementData.weight = values.weight;
        if (values.bodyFatPercentage !== null)
          measurementData.bodyFatPercentage = values.bodyFatPercentage;
        if (values.chest !== null) measurementData.chest = values.chest;
        if (values.waist !== null) measurementData.waist = values.waist;
        if (values.hips !== null) measurementData.hips = values.hips;
        if (values.leftArm !== null) measurementData.leftArm = values.leftArm;
        if (values.rightArm !== null) measurementData.rightArm = values.rightArm;
        if (values.leftThigh !== null) measurementData.leftThigh = values.leftThigh;
        if (values.rightThigh !== null) measurementData.rightThigh = values.rightThigh;
        if (values.leftCalf !== null) measurementData.leftCalf = values.leftCalf;
        if (values.rightCalf !== null) measurementData.rightCalf = values.rightCalf;
        if (values.neck !== null) measurementData.neck = values.neck;
        if (values.shoulders !== null) measurementData.shoulders = values.shoulders;
        if (values.notes) measurementData.notes = values.notes;

        if (editingId) {
          await updateMeasurement({
            id: editingId,
            ...measurementData,
          } as Parameters<typeof updateMeasurement>[0]);
          notifications.show({
            title: "Measurement updated",
            message: "Your measurement has been updated successfully.",
            color: "green",
          });
        } else {
          await createMeasurement(measurementData as Parameters<typeof createMeasurement>[0]);
          notifications.show({
            title: "Measurement logged",
            message: "Your measurement has been recorded successfully.",
            color: "green",
          });
        }
        closeModal();
      } catch {
        notifications.show({
          title: "Error",
          message: editingId
            ? "Failed to update measurement. Please try again."
            : "Failed to log measurement. Please try again.",
          color: "red",
        });
        throw new Error("Failed to save measurement");
      }
    },
    [editingId, createMeasurement, updateMeasurement, closeModal],
  );

  // Error state
  if (isError) {
    return (
      <Box p={{ base: "sm", md: "md" }} className={styles.measurementsContainer} data-error="true">
        <Stack gap="md">
          <PageHeader
            title="Body Measurements"
            description="Track your body measurements and progress"
          />
          <ErrorState
            title="Failed to load measurements"
            message="There was an error loading your measurements. Please try again."
            onRetry={refetch}
          />
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      p={{ base: "sm", md: "md" }}
      className={styles.measurementsContainer}
      data-loading={isLoading ? "true" : undefined}
    >
      <Stack gap="md">
        {/* Page header */}
        <PageHeader
          title="Body Measurements"
          description="Track your body measurements and progress over time"
        />

        {/* Summary statistics */}
        <MeasurementsSummary summary={summary} onLogMeasurement={handleLogMeasurement} />

        {/* Trend chart */}
        <WeightTrendChart
          data={chartData}
          isLoading={isLoading}
          period={period}
          onPeriodChange={setPeriod}
        />

        {/* Measurement history */}
        <MeasurementsHistory
          measurements={historyData}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Stack>

      {/* Log/Edit Measurement Modal */}
      <LogMeasurementModal
        opened={modalOpened}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        initialValues={editInitialValues}
        mode={editingId ? "edit" : "create"}
      />
    </Box>
  );
}
