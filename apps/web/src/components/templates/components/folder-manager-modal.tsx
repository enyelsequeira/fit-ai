import { Modal, TextInput, Button, Stack, Group, Text } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { IconFolder, IconTrash } from "@tabler/icons-react";
import { useCreateFolder, useUpdateFolder, useDeleteFolder } from "../hooks/use-mutations";

interface FolderManagerModalProps {
  opened: boolean;
  onClose: () => void;
  folder: { id: number; name: string } | null;
}

export function FolderManagerModal({ opened, onClose, folder }: FolderManagerModalProps) {
  const createFolderMutation = useCreateFolder();
  const updateFolderMutation = useUpdateFolder();
  const deleteFolderMutation = useDeleteFolder();

  const isEditing = folder !== null;

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: isEditing ? folder?.name : "",
    },
    validate: {
      name: isNotEmpty("Folder name is required"),
    },
  });

  const isSubmitting = createFolderMutation.isPending || updateFolderMutation.isPending;
  const isDeleting = deleteFolderMutation.isPending;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      centered
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconFolder size={20} />
          {isEditing ? "Edit Folder" : "Create New Folder"}
        </Group>
      }
      size="sm"
    >
      <form
        onSubmit={form.onSubmit((values) => {
          const mutation = isEditing ? updateFolderMutation : createFolderMutation;
          const payload = isEditing
            ? { id: folder!.id, name: values.name.trim() }
            : { name: values.name.trim() };

          mutation.mutate(payload as never, {
            onSuccess: () => {
              form.reset();
              onClose();
            },
          });
        })}
      >
        <Stack gap="md">
          <TextInput
            label="Folder Name"
            placeholder="e.g., Push Pull Legs"
            required
            data-autofocus
            key={form.key("name")}
            {...form.getInputProps("name")}
          />

          {isEditing && (
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Danger Zone
              </Text>
              <Text size="xs" c="dimmed">
                Deleting this folder will not delete the templates inside. They will become
                uncategorized.
              </Text>
              <Button
                variant="light"
                color="red"
                leftSection={<IconTrash size={14} />}
                loading={isDeleting}
                disabled={isSubmitting}
                onClick={() =>
                  deleteFolderMutation.mutate(
                    { id: folder!.id },
                    {
                      onSuccess: () => {
                        form.reset();
                        onClose();
                      },
                    },
                  )
                }
              >
                Delete Folder
              </Button>
            </Stack>
          )}

          <Group justify="flex-end" gap="sm" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={isSubmitting || isDeleting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={isDeleting}>
              {isEditing ? "Save Changes" : "Create Folder"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
