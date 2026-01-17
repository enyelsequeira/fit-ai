/**
 * CreateWorkoutModal - Modal for creating a new workout session
 * Supports both blank workouts and starting from templates
 * For multi-day templates, allows user to select which day to start
 */

import { useEffect, useMemo } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Group,
  Center,
  Text,
  Loader,
  Paper,
  Badge,
  Radio,
} from "@mantine/core";
import { IconBarbell, IconTemplate, IconCalendar } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useNavigate } from "@tanstack/react-router";
import { useCreateWorkout } from "../../hooks/use-mutations.ts";
import { useStartWorkout } from "@/components/templates/hooks/use-mutations.ts";
import { useTemplatesList } from "@/components/templates/queries/use-queries.ts";
import { useTemplateById } from "@/components/templates/queries/use-queries.ts";
import styles from "./create-workout-modal.module.css";

interface TemplateDay {
  id: number;
  name: string;
  description?: string | null;
  isRestDay?: boolean;
  exercises?: Array<{ id: number }>;
}

interface CreateWorkoutModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateWorkoutModal({ opened, onClose }: CreateWorkoutModalProps) {
  const navigate = useNavigate();
  const createWorkoutMutation = useCreateWorkout();
  const startWorkoutMutation = useStartWorkout();

  // Fetch templates for optional template selection
  const { data: templatesData, isLoading: templatesLoading } = useTemplatesList();
  const templates = templatesData ?? [];

  const form = useForm({
    initialValues: {
      name: "",
      notes: "",
      templateId: null as string | null,
      dayId: null as string | null,
    },
    validate: {
      name: (value, values) => {
        // Name is required only if not using a template
        if (!values.templateId && !value.trim()) {
          return "Workout name is required";
        }
        if (value.length > 100) return "Name must be 100 characters or less";
        return null;
      },
    },
  });

  // Fetch full template details when a template is selected
  const selectedTemplateId = form.values.templateId ? Number(form.values.templateId) : null;
  const { data: selectedTemplateData, isLoading: templateDetailsLoading } =
    useTemplateById(selectedTemplateId);

  // Extract days from selected template (if available)
  // Note: days property may not exist yet if schema hasn't been updated
  const templateDays: TemplateDay[] = useMemo(() => {
    if (!selectedTemplateData) return [];
    // Check if the template has a 'days' property (future schema)
    const days = (selectedTemplateData as { days?: TemplateDay[] }).days;
    if (Array.isArray(days)) {
      return days;
    }
    return [];
  }, [selectedTemplateData]);

  const hasMultipleDays = templateDays.length > 1;
  const workoutDays = templateDays.filter((d) => !d.isRestDay);

  // Template options with additional info
  const templateOptions = useMemo(() => {
    return templates.map((template) => {
      // Check if template has days info
      const days = (template as { days?: TemplateDay[] }).days;
      const daysCount = Array.isArray(days) ? days.length : 0;
      const exerciseCount =
        (template as { exercises?: Array<{ id: number }> }).exercises?.length ?? 0;

      let description = "";
      if (daysCount > 0) {
        description = `${daysCount} day${daysCount > 1 ? "s" : ""}`;
        const totalExercises = Array.isArray(days)
          ? days.reduce((acc: number, d) => acc + ((d as TemplateDay).exercises?.length ?? 0), 0)
          : 0;
        if (totalExercises > 0) {
          description += `, ${totalExercises} exercises`;
        }
      } else if (exerciseCount > 0) {
        description = `${exerciseCount} exercise${exerciseCount > 1 ? "s" : ""}`;
      }

      return {
        value: String(template.id),
        label: template.name,
        description,
      };
    });
  }, [templates]);

  // Auto-select first workout day for single-day templates
  useEffect(() => {
    if (form.values.templateId && workoutDays.length === 1 && !form.values.dayId) {
      const firstDay = workoutDays[0];
      if (firstDay) {
        form.setFieldValue("dayId", String(firstDay.id));
      }
    }
  }, [form.values.templateId, workoutDays.length]);

  // Reset dayId when template changes
  useEffect(() => {
    if (!form.values.templateId) {
      form.setFieldValue("dayId", null);
    }
  }, [form.values.templateId]);

  const handleSubmit = form.onSubmit((values) => {
    if (values.templateId) {
      // Start from template
      const templateId = Number(values.templateId);
      const dayId = values.dayId ? Number(values.dayId) : undefined;

      startWorkoutMutation.mutate(
        {
          id: templateId,
          // Note: dayId will be passed when API supports it
          ...(dayId !== undefined && { dayId }),
        } as { id: number },
        {
          onSuccess: (data) => {
            onClose();
            form.reset();
            navigate({ to: `/dashboard/workouts/${data.id}` as string });
          },
        },
      );
    } else {
      // Create blank workout
      createWorkoutMutation.mutate(
        {
          name: values.name.trim() || null,
          notes: values.notes.trim() || null,
          rating: null,
        },
        {
          onSuccess: (data) => {
            onClose();
            form.reset();
            navigate({ to: `/dashboard/workouts/${data.id}` as string });
          },
        },
      );
    }
  });

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const isLoading = createWorkoutMutation.isPending || startWorkoutMutation.isPending;
  const isSubmitDisabled = (() => {
    // If using template with multiple days, require day selection
    if (form.values.templateId && hasMultipleDays && !form.values.dayId) {
      return true;
    }
    // If using template with days but no workout days available
    if (form.values.templateId && templateDays.length > 0 && workoutDays.length === 0) {
      return true;
    }
    // If not using template, require name
    if (!form.values.templateId && !form.getValues().name.trim()) {
      return true;
    }
    return false;
  })();

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <Center w={24} h={24} className={styles.modalIcon}>
            <IconBarbell size={20} />
          </Center>
          <Text fw={600}>Start New Workout</Text>
        </Group>
      }
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md" py="xs">
          {/* Template Selection */}
          <Select
            label="Start from Template (Optional)"
            placeholder={templatesLoading ? "Loading templates..." : "Select a template"}
            leftSection={templatesLoading ? <Loader size={14} /> : <IconTemplate size={16} />}
            data={templateOptions}
            clearable
            searchable
            disabled={templatesLoading}
            {...form.getInputProps("templateId")}
            description="Pre-populate exercises from a saved template"
          />

          {/* Day Selection - Only show for multi-day templates */}
          {form.values.templateId && hasMultipleDays && (
            <Paper withBorder p="md" className={styles.daySelectionPaper}>
              <Group gap="xs" mb="sm">
                <IconCalendar size={18} className={styles.daySelectionIcon} />
                <Text size="sm" fw={500}>
                  Select workout day
                </Text>
              </Group>

              {templateDetailsLoading ? (
                <Center py="md">
                  <Loader size="sm" />
                </Center>
              ) : workoutDays.length > 0 ? (
                <Radio.Group
                  value={form.values.dayId ?? ""}
                  onChange={(value) => form.setFieldValue("dayId", value || null)}
                >
                  <Stack gap="xs">
                    {workoutDays.map((day) => (
                      <Radio
                        key={day.id}
                        value={String(day.id)}
                        label={
                          <Group gap="xs">
                            <Text size="sm">{day.name}</Text>
                            <Badge size="xs" variant="light" color="blue">
                              {day.exercises?.length ?? 0} exercise
                              {(day.exercises?.length ?? 0) !== 1 ? "s" : ""}
                            </Badge>
                          </Group>
                        }
                        description={day.description}
                        className={styles.dayRadioOption}
                      />
                    ))}
                  </Stack>
                </Radio.Group>
              ) : (
                <Text c="dimmed" size="sm" ta="center" py="sm">
                  No workout days available (all rest days)
                </Text>
              )}
            </Paper>
          )}

          {/* Show selected template info for single-day templates or templates without days */}
          {form.values.templateId && !hasMultipleDays && selectedTemplateData && (
            <Paper withBorder p="sm" className={styles.templateInfoPaper}>
              {templateDays.length === 1 && templateDays[0] ? (
                <Text size="sm" c="dimmed">
                  Starting: <strong>{templateDays[0].name}</strong> (
                  {templateDays[0].exercises?.length ?? 0} exercise
                  {(templateDays[0].exercises?.length ?? 0) !== 1 ? "s" : ""})
                </Text>
              ) : (
                <Text size="sm" c="dimmed">
                  Starting workout with{" "}
                  <strong>
                    {(selectedTemplateData as { exercises?: Array<{ id: number }> }).exercises
                      ?.length ?? 0}{" "}
                    exercise
                    {((selectedTemplateData as { exercises?: Array<{ id: number }> }).exercises
                      ?.length ?? 0) !== 1
                      ? "s"
                      : ""}
                  </strong>{" "}
                  from {selectedTemplateData.name}
                </Text>
              )}
            </Paper>
          )}

          {/* Workout name and notes - only for blank workouts */}
          {!form.values.templateId && (
            <>
              <TextInput
                label="Workout Name"
                placeholder="e.g., Morning Strength Training"
                required
                {...form.getInputProps("name")}
              />

              <Textarea
                label="Notes (Optional)"
                placeholder="Any notes for this session..."
                minRows={2}
                maxRows={4}
                {...form.getInputProps("notes")}
              />
            </>
          )}

          <Group justify="flex-end" gap="sm" pt="md" mt="md" className={styles.modalActions}>
            <Button onClick={handleClose} variant="subtle">
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              disabled={isSubmitDisabled}
              leftSection={<IconBarbell size={16} />}
            >
              Start Workout
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
