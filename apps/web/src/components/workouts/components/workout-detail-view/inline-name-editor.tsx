import type { KeyboardEvent } from "react";

import { ActionIcon, Group, Paper, TextInput } from "@mantine/core";
import { IconDeviceFloppy, IconX } from "@tabler/icons-react";

import styles from "./workout-detail-view.module.css";

interface InlineNameEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function InlineNameEditor({
  value,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: InlineNameEditorProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSave();
    else if (e.key === "Escape") onCancel();
  };

  return (
    <Paper withBorder p="lg" radius="md" className={styles.headerPaper}>
      <Group gap="xs">
        <TextInput
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          size="lg"
          fw={700}
          autoFocus
          style={{ flex: 1 }}
          aria-label="Workout name"
        />
        <ActionIcon
          variant="filled"
          color="green"
          onClick={onSave}
          loading={isSaving}
          aria-label="Save name"
        >
          <IconDeviceFloppy size={16} />
        </ActionIcon>
        <ActionIcon variant="subtle" color="gray" onClick={onCancel} aria-label="Cancel edit">
          <IconX size={16} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}
