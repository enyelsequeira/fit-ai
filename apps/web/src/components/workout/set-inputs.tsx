import type { WeightUnit } from "./set-row-utils";

import { IconMinus, IconPlus } from "@tabler/icons-react";

import { ActionIcon, Flex, NumberInput } from "@mantine/core";

import { calculateIncrement } from "./set-row-utils";

const INPUT_STYLES = {
  input: {
    height: 28,
    minHeight: 28,
    textAlign: "center" as const,
    paddingLeft: 4,
    paddingRight: 4,
  },
};

const COMPACT_INPUT_STYLES = {
  input: {
    height: 32,
    minHeight: 32,
    textAlign: "center" as const,
  },
};

interface SetInputsProps {
  weight: number | null;
  reps: number | null;
  weightUnit: WeightUnit;
  disabled: boolean;
  onWeightChange: (value: number | null) => void;
  onRepsChange: (value: number | null) => void;
}

function WeightInput({
  weight,
  weightUnit,
  disabled,
  onWeightChange,
  showControls = true,
}: {
  weight: number | null;
  weightUnit: WeightUnit;
  disabled: boolean;
  onWeightChange: (value: number | null) => void;
  showControls?: boolean;
}) {
  const handleIncrement = (increment: number) => {
    onWeightChange(calculateIncrement(weight, increment));
  };

  const handleChange = (value: string | number) => {
    onWeightChange(typeof value === "number" ? value : null);
  };

  if (!showControls) {
    return (
      <NumberInput
        value={weight ?? ""}
        onChange={handleChange}
        disabled={disabled}
        size="xs"
        w={64}
        hideControls
        placeholder={weightUnit}
        styles={COMPACT_INPUT_STYLES}
      />
    );
  }

  return (
    <Flex align="center" gap={2}>
      <ActionIcon
        variant="subtle"
        size="xs"
        onClick={() => handleIncrement(-2.5)}
        disabled={disabled}
        aria-label="Decrease weight"
      >
        <IconMinus style={{ width: 12, height: 12 }} />
      </ActionIcon>
      <NumberInput
        value={weight ?? ""}
        onChange={handleChange}
        disabled={disabled}
        size="xs"
        w={64}
        hideControls
        placeholder={weightUnit}
        styles={INPUT_STYLES}
      />
      <ActionIcon
        variant="subtle"
        size="xs"
        onClick={() => handleIncrement(2.5)}
        disabled={disabled}
        aria-label="Increase weight"
      >
        <IconPlus style={{ width: 12, height: 12 }} />
      </ActionIcon>
    </Flex>
  );
}

function RepsInput({
  reps,
  disabled,
  onRepsChange,
  showControls = true,
}: {
  reps: number | null;
  disabled: boolean;
  onRepsChange: (value: number | null) => void;
  showControls?: boolean;
}) {
  const handleIncrement = (increment: number) => {
    onRepsChange(calculateIncrement(reps, increment));
  };

  const handleChange = (value: string | number) => {
    onRepsChange(typeof value === "number" ? value : null);
  };

  if (!showControls) {
    return (
      <NumberInput
        value={reps ?? ""}
        onChange={handleChange}
        disabled={disabled}
        size="xs"
        w={48}
        hideControls
        placeholder="reps"
        styles={COMPACT_INPUT_STYLES}
      />
    );
  }

  return (
    <Flex align="center" gap={2}>
      <ActionIcon
        variant="subtle"
        size="xs"
        onClick={() => handleIncrement(-1)}
        disabled={disabled}
        aria-label="Decrease reps"
      >
        <IconMinus style={{ width: 12, height: 12 }} />
      </ActionIcon>
      <NumberInput
        value={reps ?? ""}
        onChange={handleChange}
        disabled={disabled}
        size="xs"
        w={48}
        hideControls
        placeholder="reps"
        styles={INPUT_STYLES}
      />
      <ActionIcon
        variant="subtle"
        size="xs"
        onClick={() => handleIncrement(1)}
        disabled={disabled}
        aria-label="Increase reps"
      >
        <IconPlus style={{ width: 12, height: 12 }} />
      </ActionIcon>
    </Flex>
  );
}

function SetInputs({
  weight,
  reps,
  weightUnit,
  disabled,
  onWeightChange,
  onRepsChange,
}: SetInputsProps) {
  return (
    <>
      <WeightInput
        weight={weight}
        weightUnit={weightUnit}
        disabled={disabled}
        onWeightChange={onWeightChange}
      />
      <RepsInput reps={reps} disabled={disabled} onRepsChange={onRepsChange} />
    </>
  );
}

export { SetInputs, WeightInput, RepsInput };
