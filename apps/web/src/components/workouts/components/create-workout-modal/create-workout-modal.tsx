/**
 * CreateWorkoutModal - Modal for creating a new workout session
 * Allows user to name the workout and optionally select a template
 */

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
} from "@mantine/core";
import { IconBarbell, IconTemplate } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useNavigate } from "@tanstack/react-router";
import { useCreateWorkout } from "../../hooks/use-mutations.ts";
import { useTemplatesList } from "@/components/templates/queries/use-queries.ts";
import styles from "./create-workout-modal.module.css";

interface CreateWorkoutModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateWorkoutModal({ opened, onClose }: CreateWorkoutModalProps) {
  const navigate = useNavigate();
  const createWorkoutMutation = useCreateWorkout();

  // Fetch templates for optional template selection
  const { data: templatesData, isLoading: templatesLoading } = useTemplatesList();
  const templates = templatesData ?? [];

  const form = useForm({
    initialValues: {
      name: "",
      notes: "",
      templateId: null as string | null,
    },
    validate: {
      name: (value) => {
        if (!value.trim()) return "Workout name is required";
        if (value.length > 100) return "Name must be 100 characters or less";
        return null;
      },
    },
  });

  const templateOptions = templates.map((template) => ({
    value: String(template.id),
    label: template.name,
  }));

  const handleSubmit = form.onSubmit((values) => {
    createWorkoutMutation.mutate(
      {
        name: values.name.trim(),
        notes: values.notes.trim() || undefined,
        templateId: values.templateId ? Number(values.templateId) : undefined,
      },
      {
        onSuccess: (data) => {
          onClose();
          form.reset();
          // Navigate to the new workout
          navigate({ to: `/dashboard/workouts/${data.id}` as string });
        },
      },
    );
  });

  const handleClose = () => {
    onClose();
    form.reset();
  };

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

          <Select
            label="Start from Template (Optional)"
            placeholder={templatesLoading ? "Loading templates..." : "Select a template"}
            leftSection={
              templatesLoading ? (
                <Loader size={14} />
              ) : (
                <IconTemplate size={16} />
              )
            }
            data={templateOptions}
            clearable
            searchable
            disabled={templatesLoading}
            {...form.getInputProps("templateId")}
            description="Pre-populate exercises from a saved template"
          />

          <Group justify="flex-end" gap="sm" pt="md" mt="md" className={styles.modalActions}>
            <Button onClick={handleClose} variant="subtle">
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createWorkoutMutation.isPending}
              disabled={!form.getValues().name.trim()}
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
