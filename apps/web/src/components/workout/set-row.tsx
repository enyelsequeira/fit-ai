import { IconCheck, IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import { useCallback } from "react";

import { ActionIcon, Box, Checkbox, Flex, Group, NumberInput, Select, Text } from "@mantine/core";

type SetType = "normal" | "warmup" | "failure" | "drop";

interface SetRowProps {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  setType: SetType;
  isCompleted: boolean;
  previousWeight?: number | null;
  previousReps?: number | null;
  weightUnit?: "kg" | "lb";
  onWeightChange: (value: number | null) => void;
  onRepsChange: (value: number | null) => void;
  onRpeChange: (value: number | null) => void;
  onSetTypeChange: (value: SetType) => void;
  onComplete: () => void;
  onDelete: () => void;
  disabled?: boolean;
  className?: string;
}

const SET_TYPE_LABELS: Record<SetType, string> = {
  normal: "Working",
  warmup: "Warmup",
  failure: "Failure",
  drop: "Drop",
};

const SET_TYPE_COLORS: Record<SetType, string> = {
  normal: "",
  warmup: "var(--mantine-color-yellow-5)",
  failure: "var(--mantine-color-red-5)",
  drop: "var(--mantine-color-blue-5)",
};

function SetRow({
  setNumber,
  weight,
  reps,
  rpe,
  setType,
  isCompleted,
  previousWeight,
  previousReps,
  weightUnit = "kg",
  onWeightChange,
  onRepsChange,
  onRpeChange,
  onSetTypeChange,
  onComplete,
  onDelete,
  disabled = false,
}: SetRowProps) {
  const showRpe = rpe !== null;

  const handleWeightIncrement = useCallback(
    (increment: number) => {
      const newWeight = (weight ?? 0) + increment;
      onWeightChange(Math.max(0, newWeight));
    },
    [weight, onWeightChange],
  );

  const handleRepsIncrement = useCallback(
    (increment: number) => {
      const newReps = (reps ?? 0) + increment;
      onRepsChange(Math.max(0, newReps));
    },
    [reps, onRepsChange],
  );

  return (
    <Box
      py="xs"
      px={4}
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr 1fr auto auto",
        alignItems: "center",
        gap: 8,
        borderBottom: "1px solid var(--mantine-color-default-border)",
        opacity: isCompleted ? 0.6 : 1,
      }}
    >
      {/* Set number / type */}
      <Box style={{ minWidth: 60 }}>
        <Select
          value={setType}
          onChange={(value) => value && onSetTypeChange(value as SetType)}
          disabled={disabled || isCompleted}
          data={Object.entries(SET_TYPE_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
          size="xs"
          w={64}
          styles={{
            input: {
              height: 28,
              minHeight: 28,
              paddingLeft: 6,
              paddingRight: 6,
              color: SET_TYPE_COLORS[setType] || undefined,
            },
          }}
          comboboxProps={{ withinPortal: true }}
        />
      </Box>

      {/* Previous performance hint */}
      <Text fz="xs" c="dimmed" ta="center" style={{ minWidth: 70 }}>
        {previousWeight && previousReps ? (
          <span>
            {previousWeight}
            {weightUnit} x {previousReps}
          </span>
        ) : (
          <span style={{ opacity: 0.5 }}>-</span>
        )}
      </Text>

      {/* Weight input */}
      <Flex align="center" gap={2}>
        <ActionIcon
          variant="subtle"
          size="xs"
          onClick={() => handleWeightIncrement(-2.5)}
          disabled={disabled || isCompleted}
          aria-label="Decrease weight"
        >
          <IconMinus style={{ width: 12, height: 12 }} />
        </ActionIcon>
        <NumberInput
          value={weight ?? ""}
          onChange={(value) => onWeightChange(typeof value === "number" ? value : null)}
          disabled={disabled || isCompleted}
          size="xs"
          w={64}
          hideControls
          placeholder={weightUnit}
          styles={{
            input: {
              height: 28,
              minHeight: 28,
              textAlign: "center",
              paddingLeft: 4,
              paddingRight: 4,
            },
          }}
        />
        <ActionIcon
          variant="subtle"
          size="xs"
          onClick={() => handleWeightIncrement(2.5)}
          disabled={disabled || isCompleted}
          aria-label="Increase weight"
        >
          <IconPlus style={{ width: 12, height: 12 }} />
        </ActionIcon>
      </Flex>

      {/* Reps input */}
      <Flex align="center" gap={2}>
        <ActionIcon
          variant="subtle"
          size="xs"
          onClick={() => handleRepsIncrement(-1)}
          disabled={disabled || isCompleted}
          aria-label="Decrease reps"
        >
          <IconMinus style={{ width: 12, height: 12 }} />
        </ActionIcon>
        <NumberInput
          value={reps ?? ""}
          onChange={(value) => onRepsChange(typeof value === "number" ? value : null)}
          disabled={disabled || isCompleted}
          size="xs"
          w={48}
          hideControls
          placeholder="reps"
          styles={{
            input: {
              height: 28,
              minHeight: 28,
              textAlign: "center",
              paddingLeft: 4,
              paddingRight: 4,
            },
          }}
        />
        <ActionIcon
          variant="subtle"
          size="xs"
          onClick={() => handleRepsIncrement(1)}
          disabled={disabled || isCompleted}
          aria-label="Increase reps"
        >
          <IconPlus style={{ width: 12, height: 12 }} />
        </ActionIcon>
      </Flex>

      {/* Complete checkbox and actions */}
      <Group gap={4}>
        {showRpe && (
          <Select
            value={rpe?.toString() ?? ""}
            onChange={(value) => onRpeChange(value ? Number(value) : null)}
            disabled={disabled || isCompleted}
            data={[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((v) => ({
              value: v.toString(),
              label: v.toString(),
            }))}
            size="xs"
            w={48}
            styles={{
              input: {
                height: 28,
                minHeight: 28,
                paddingLeft: 4,
                paddingRight: 4,
              },
            }}
            comboboxProps={{ withinPortal: true }}
          />
        )}

        <Checkbox
          checked={isCompleted}
          onChange={() => onComplete()}
          disabled={disabled || (!weight && !reps)}
          size="md"
          color="green"
          styles={{
            input: {
              width: 24,
              height: 24,
              cursor: "pointer",
            },
          }}
        />

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
      </Group>
    </Box>
  );
}

// Compact version for mobile
function SetRowCompact({
  setNumber,
  weight,
  reps,
  setType,
  isCompleted,
  previousWeight,
  previousReps,
  weightUnit = "kg",
  onWeightChange,
  onRepsChange,
  onComplete,
  onDelete,
  disabled = false,
}: Omit<SetRowProps, "rpe" | "onRpeChange" | "onSetTypeChange">) {
  return (
    <Flex align="center" gap="xs" py="xs" style={{ opacity: isCompleted ? 0.6 : 1 }}>
      <Text
        w={24}
        ta="center"
        fz="xs"
        fw={500}
        c={
          setType === "warmup"
            ? "yellow"
            : setType === "failure"
              ? "red"
              : setType === "drop"
                ? "blue"
                : undefined
        }
      >
        {setNumber}
      </Text>

      <Text fz="xs" c="dimmed" style={{ minWidth: 50 }}>
        {previousWeight && previousReps ? `${previousWeight}x${previousReps}` : "-"}
      </Text>

      <NumberInput
        value={weight ?? ""}
        onChange={(value) => onWeightChange(typeof value === "number" ? value : null)}
        disabled={disabled || isCompleted}
        size="xs"
        w={64}
        hideControls
        placeholder={weightUnit}
        styles={{
          input: {
            height: 32,
            minHeight: 32,
            textAlign: "center",
          },
        }}
      />

      <NumberInput
        value={reps ?? ""}
        onChange={(value) => onRepsChange(typeof value === "number" ? value : null)}
        disabled={disabled || isCompleted}
        size="xs"
        w={48}
        hideControls
        placeholder="reps"
        styles={{
          input: {
            height: 32,
            minHeight: 32,
            textAlign: "center",
          },
        }}
      />

      <ActionIcon
        variant={isCompleted ? "filled" : "outline"}
        size="sm"
        onClick={onComplete}
        disabled={disabled || (!weight && !reps)}
        color={isCompleted ? "green" : undefined}
      >
        <IconCheck style={{ width: 16, height: 16 }} />
      </ActionIcon>

      <ActionIcon variant="subtle" size="sm" onClick={onDelete} disabled={disabled} c="dimmed">
        <IconTrash style={{ width: 12, height: 12 }} />
      </ActionIcon>
    </Flex>
  );
}

export { SetRow, SetRowCompact, SET_TYPE_LABELS };
export type { SetType };
