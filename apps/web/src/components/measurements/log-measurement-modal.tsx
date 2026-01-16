/**
 * LogMeasurementModal - Modal form for logging body measurements
 * Supports both quick weight entry and full detailed measurements
 */

import { useState } from "react";
import { Box, Button, Group, Modal, Tabs, Textarea } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconCalendar, IconNotes, IconRuler, IconScale } from "@tabler/icons-react";

import { DetailedMeasurementsForm } from "./detailed-measurements-form";
import styles from "./log-measurement-modal.module.css";
import { defaultMeasurementValues, type MeasurementFormValues } from "./measurement-types";
import { QuickWeightForm } from "./quick-weight-form";

interface LogMeasurementModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: MeasurementFormValues) => Promise<void>;
  isSubmitting: boolean;
  initialValues?: Partial<MeasurementFormValues>;
  mode?: "create" | "edit";
}

export type { MeasurementFormValues };

export function LogMeasurementModal({
  opened,
  onClose,
  onSubmit,
  isSubmitting,
  initialValues,
  mode = "create",
}: LogMeasurementModalProps) {
  const [activeTab, setActiveTab] = useState<string | null>("quick");

  const form = useForm<MeasurementFormValues>({
    initialValues: { ...defaultMeasurementValues, ...initialValues },
    validate: {
      weight: (value) => {
        if (activeTab === "quick" && (value === null || value === undefined || value <= 0)) {
          return "Weight is required for quick entry";
        }
        return null;
      },
      bodyFatPercentage: (value) => {
        if (value !== null && (value < 0 || value > 100)) {
          return "Body fat must be between 0 and 100";
        }
        return null;
      },
    },
  });

  const handleSubmit = async (values: MeasurementFormValues) => {
    try {
      await onSubmit(values);
      form.reset();
      setActiveTab("quick");
      onClose();
    } catch {
      // Error handling is done by the parent component
    }
  };

  const handleClose = () => {
    form.reset();
    setActiveTab("quick");
    onClose();
  };

  const modalTitle = mode === "create" ? "Log Measurement" : "Edit Measurement";
  const submitLabel = mode === "create" ? "Log Measurement" : "Save Changes";

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={modalTitle}
      size="lg"
      className={styles.modal}
      data-mode={mode}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List grow>
            <Tabs.Tab value="quick" leftSection={<IconScale size={16} />}>
              Quick Entry
            </Tabs.Tab>
            <Tabs.Tab value="detailed" leftSection={<IconRuler size={16} />}>
              Full Measurements
            </Tabs.Tab>
          </Tabs.List>

          <Box mt="md">
            <Group mb="md" grow>
              <DatePickerInput
                label="Date"
                placeholder="Select date"
                leftSection={<IconCalendar size={16} />}
                valueFormat="MMM D, YYYY"
                maxDate={new Date()}
                {...form.getInputProps("measuredAt")}
              />
            </Group>

            <Tabs.Panel value="quick">
              <QuickWeightForm form={form} />
            </Tabs.Panel>

            <Tabs.Panel value="detailed">
              <DetailedMeasurementsForm form={form} />
            </Tabs.Panel>

            <Box mt="md">
              <Textarea
                label="Notes"
                placeholder="Add any notes about this measurement..."
                leftSection={<IconNotes size={16} />}
                minRows={2}
                maxRows={4}
                {...form.getInputProps("notes")}
              />
            </Box>
          </Box>
        </Tabs>

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            className={styles.submitButton}
            data-submitting={isSubmitting ? "true" : undefined}
          >
            {submitLabel}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
