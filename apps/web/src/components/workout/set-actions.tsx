import { IconCheck, IconTrash } from "@tabler/icons-react";

import { ActionIcon, Checkbox, Group, Select } from "@mantine/core";

import { RPE_OPTIONS } from "./set-row-utils";

const RPE_INPUT_STYLES = {
  input: {
    height: 28,
    minHeight: 28,
    paddingLeft: 4,
    paddingRight: 4,
  },
};

const CHECKBOX_STYLES = {
  input: {
    width: 24,
    height: 24,
    cursor: "pointer",
  },
};

interface SetActionsProps {
  isCompleted: boolean;
  disabled: boolean;
  canComplete: boolean;
  rpe: number | null;
  showRpe: boolean;
  onComplete: () => void;
  onDelete: () => void;
  onRpeChange: (value: number | null) => void;
}

interface CompactSetActionsProps {
  isCompleted: boolean;
  disabled: boolean;
  canComplete: boolean;
  onComplete: () => void;
  onDelete: () => void;
}

function RpeSelect({
  rpe,
  disabled,
  onRpeChange,
}: {
  rpe: number | null;
  disabled: boolean;
  onRpeChange: (value: number | null) => void;
}) {
  const handleChange = (value: string | null) => {
    onRpeChange(value ? Number(value) : null);
  };

  return (
    <Select
      value={rpe?.toString() ?? ""}
      onChange={handleChange}
      disabled={disabled}
      data={RPE_OPTIONS}
      size="xs"
      w={48}
      styles={RPE_INPUT_STYLES}
      comboboxProps={{ withinPortal: true }}
    />
  );
}

function CompleteCheckbox({
  isCompleted,
  disabled,
  canComplete,
  onComplete,
}: {
  isCompleted: boolean;
  disabled: boolean;
  canComplete: boolean;
  onComplete: () => void;
}) {
  return (
    <Checkbox
      checked={isCompleted}
      onChange={onComplete}
      disabled={disabled || !canComplete}
      size="md"
      color="green"
      styles={CHECKBOX_STYLES}
    />
  );
}

function DeleteButton({ disabled, onDelete }: { disabled: boolean; onDelete: () => void }) {
  return (
    <ActionIcon
      variant="subtle"
      size="xs"
      onClick={onDelete}
      disabled={disabled}
      c="dimmed"
      aria-label="Delete set"
    >
      <IconTrash style={{ width: 12, height: 12 }} />
    </ActionIcon>
  );
}

function SetActions({
  isCompleted,
  disabled,
  canComplete,
  rpe,
  showRpe,
  onComplete,
  onDelete,
  onRpeChange,
}: SetActionsProps) {
  return (
    <Group gap={4}>
      {showRpe && (
        <RpeSelect rpe={rpe} disabled={disabled || isCompleted} onRpeChange={onRpeChange} />
      )}
      <CompleteCheckbox
        isCompleted={isCompleted}
        disabled={disabled}
        canComplete={canComplete}
        onComplete={onComplete}
      />
      <DeleteButton disabled={disabled} onDelete={onDelete} />
    </Group>
  );
}

function CompactSetActions({
  isCompleted,
  disabled,
  canComplete,
  onComplete,
  onDelete,
}: CompactSetActionsProps) {
  return (
    <>
      <ActionIcon
        variant={isCompleted ? "filled" : "outline"}
        size="sm"
        onClick={onComplete}
        disabled={disabled || !canComplete}
        color={isCompleted ? "green" : undefined}
      >
        <IconCheck style={{ width: 16, height: 16 }} />
      </ActionIcon>
      <ActionIcon variant="subtle" size="sm" onClick={onDelete} disabled={disabled} c="dimmed">
        <IconTrash style={{ width: 12, height: 12 }} />
      </ActionIcon>
    </>
  );
}

export { SetActions, CompactSetActions, RpeSelect, CompleteCheckbox, DeleteButton };
