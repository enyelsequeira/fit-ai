import {
  Modal,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Switch,
  Button,
  Stack,
  Group,
  Box,
  Center,
} from "@mantine/core";
import { IconTemplate } from "@tabler/icons-react";
import styles from "./create-template-modal.module.css";
import { useForm } from "@mantine/form";
import { useCreateTemplate } from "@/components/templates/hooks/use-mutations.ts";

interface Folder {
  id: number;
  name: string;
}

interface CreateTemplateModalProps {
  opened: boolean;
  onClose: () => void;
  folders: Folder[];
  defaultFolderId?: number | null;
}

export function CreateTemplateModal({
  opened,
  onClose,
  folders,
  defaultFolderId,
}: CreateTemplateModalProps) {
  const createTemplateMutation = useCreateTemplate();

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      folderId: defaultFolderId ? String(defaultFolderId) : null,
      estimatedDurationMinutes: 45,
      isPublic: false,
    },
  });

  const folderOptions = folders.map((folder) => ({
    value: String(folder.id),
    label: folder.name,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Center w={24} h={24} c="blue">
            <IconTemplate size={20} />
          </Center>
          Create New Template
        </Group>
      }
      size="md"
    >
      <form
        onSubmit={form.onSubmit(async (e) => {
          createTemplateMutation.mutate(
            {
              ...e,
              folderId: e.folderId ? Number(e.folderId) : null,
            },
            {
              onSettled: () => {
                onClose();
                form.reset();
              },
            },
          );
        })}
      >
        <Stack gap="md" py="xs">
          <TextInput
            label="Template Name"
            placeholder="e.g., Upper Body Strength"
            required
            {...form.getInputProps("name")}
          />

          <Textarea
            label="Description"
            placeholder="Describe your workout template..."
            minRows={2}
            maxRows={4}
            {...form.getInputProps("description")}
          />

          <Select
            label="Folder"
            placeholder="Select a folder (optional)"
            data={folderOptions}
            clearable
            searchable
            {...form.getInputProps("folderId")}
          />

          <NumberInput
            label="Estimated Duration (minutes)"
            placeholder="45"
            min={1}
            max={300}
            suffix=" min"
            {...form.getInputProps("estimatedDurationMinutes")}
          />

          <Box p="sm" className={styles.publicSwitch}>
            <Switch
              label="Make this template public"
              description="Public templates can be discovered and used by other users"
              {...form.getInputProps("isPublic", { type: "checkbox" })}
            />
          </Box>

          <Group justify="flex-end" gap="sm" pt="md" mt="md" className={styles.modalActions}>
            <Button onClick={onClose} variant="subtle">
              Cancel
            </Button>
            <Button
              type={"submit"}
              loading={createTemplateMutation.isPending}
              disabled={!form.getValues().name.trim()}
            >
              Create Template
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
