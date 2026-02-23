/**
 * MeasurementsView - Main body measurements page component
 * Uses sidebar + FitAiPageHeader + FitAiContentArea layout matching goals/workouts
 */

import type { MeasurementFormValues } from "./log-measurement-modal";

import { useCallback, useState } from "react";
import { Box, Container, Flex, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconRuler2 } from "@tabler/icons-react";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import { FitAiContentArea } from "@/components/ui/fit-ai-content-area/fit-ai-content-area";
import { FitAiPageHeader } from "@/components/ui/fit-ai-page-header/fit-ai-page-header";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import { LogMeasurementModal } from "./log-measurement-modal";
import { MeasurementsHistory } from "./measurements-history";
import { MeasurementsSummary } from "./measurements-summary";
import styles from "./measurements-view.module.css";
import { useMeasurementsData } from "./use-measurements-data";
import { WeightTrendChart } from "./weight-trend-chart";

export function MeasurementsView() {
  const {
    summary,
    chartData,
    historyData,
    period,
    setPeriod,
    isLoading,
    createMeasurement,
    updateMeasurement,
    deleteMeasurement,
    isCreating,
    isUpdating,
  } = useMeasurementsData();

  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editInitialValues, setEditInitialValues] = useState<
    Partial<MeasurementFormValues> | undefined
  >(undefined);

  const handleLogMeasurement = useCallback(() => {
    setEditingId(null);
    setEditInitialValues(undefined);
    openModal();
  }, [openModal]);

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
          leftCalf: measurement.leftCalf,
          rightCalf: measurement.rightCalf,
          neck: measurement.neck,
          shoulders: measurement.shoulders,
          notes: measurement.notes ?? "",
        });
        openModal();
      }
    },
    [historyData, openModal],
  );

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

  const handleSubmit = useCallback(
    async (values: MeasurementFormValues) => {
      try {
        const measurementData: Record<string, unknown> = {
          measuredAt: values.measuredAt,
          weightUnit: values.weightUnit,
          lengthUnit: values.lengthUnit,
        };

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
              <IconRuler2 size={20} />
            </Flex>
            <FitAiText variant="subheading">Measurements</FitAiText>
          </Group>
        </div>

        <div className={styles.sidebarContent} />

        <Box p="md" className={styles.sidebarFooter}>
          <FitAiButton
            variant="primary"
            fullWidth
            leftSection={<IconPlus size={16} />}
            onClick={handleLogMeasurement}
            className={styles.createButton}
          >
            Log Measurement
          </FitAiButton>
        </Box>
      </div>

      {/* Main Content */}
      <Container fluid flex={1}>
        <FitAiPageHeader>
          <FitAiPageHeader.Title>Body Measurements</FitAiPageHeader.Title>
          <FitAiPageHeader.Description>
            Track your body measurements and progress over time
          </FitAiPageHeader.Description>
          <FitAiPageHeader.Actions>
            <FitAiPageHeader.Action
              variant="primary"
              icon={<IconPlus size={16} />}
              onClick={handleLogMeasurement}
            >
              Log Measurement
            </FitAiPageHeader.Action>
          </FitAiPageHeader.Actions>
          <FitAiPageHeader.Stats>
            <MeasurementsSummary summary={summary} />
          </FitAiPageHeader.Stats>
        </FitAiPageHeader>

        <FitAiContentArea>
          <Stack gap="lg">
            <WeightTrendChart
              data={chartData}
              isLoading={isLoading}
              period={period}
              onPeriodChange={setPeriod}
            />
            <MeasurementsHistory
              measurements={historyData}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Stack>
        </FitAiContentArea>
      </Container>

      <LogMeasurementModal
        key={editingId ?? "create"}
        opened={modalOpened}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        initialValues={editInitialValues}
        mode={editingId ? "edit" : "create"}
      />
    </>
  );
}
