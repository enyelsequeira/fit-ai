import type { SetType, WeightUnit } from "./set-row-utils";

import { Box, Flex } from "@mantine/core";

import { CompactSetActions, SetActions } from "./set-actions";
import { RepsInput, SetInputs, WeightInput } from "./set-inputs";
import { PreviousPerformance, SetNumberIndicator, SetTypeSelect } from "./set-indicators";
import { SET_TYPE_LABELS } from "./set-row-utils";

interface SetRowProps {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  setType: SetType;
  isCompleted: boolean;
  previousWeight?: number | null;
  previousReps?: number | null;
  weightUnit?: WeightUnit;
  onWeightChange: (value: number | null) => void;
  onRepsChange: (value: number | null) => void;
  onRpeChange: (value: number | null) => void;
  onSetTypeChange: (value: SetType) => void;
  onComplete: () => void;
  onDelete: () => void;
  disabled?: boolean;
  className?: string;
}

type SetRowCompactProps = Omit<SetRowProps, "rpe" | "onRpeChange" | "onSetTypeChange">;

function SetRow({
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
  const canComplete = Boolean(weight || reps);
  const isDisabled = disabled || isCompleted;

  return (
    <Box
      py="xs"
      px={4}
      data-completed={isCompleted || undefined}
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr 1fr auto auto",
        alignItems: "center",
        gap: 8,
        borderBottom: "1px solid var(--mantine-color-default-border)",
        opacity: isCompleted ? 0.6 : 1,
      }}
    >
      <SetTypeSelect setType={setType} disabled={isDisabled} onSetTypeChange={onSetTypeChange} />

      <PreviousPerformance
        previousWeight={previousWeight}
        previousReps={previousReps}
        weightUnit={weightUnit}
      />

      <SetInputs
        weight={weight}
        reps={reps}
        weightUnit={weightUnit}
        disabled={isDisabled}
        onWeightChange={onWeightChange}
        onRepsChange={onRepsChange}
      />

      <SetActions
        isCompleted={isCompleted}
        disabled={disabled}
        canComplete={canComplete}
        rpe={rpe}
        showRpe={showRpe}
        onComplete={onComplete}
        onDelete={onDelete}
        onRpeChange={onRpeChange}
      />
    </Box>
  );
}

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
}: SetRowCompactProps) {
  const canComplete = Boolean(weight || reps);
  const isDisabled = disabled || isCompleted;

  return (
    <Flex
      align="center"
      gap="xs"
      py="xs"
      data-completed={isCompleted || undefined}
      style={{ opacity: isCompleted ? 0.6 : 1 }}
    >
      <SetNumberIndicator setNumber={setNumber} setType={setType} />

      <PreviousPerformance
        previousWeight={previousWeight}
        previousReps={previousReps}
        weightUnit={weightUnit}
        compact
      />

      <WeightInput
        weight={weight}
        weightUnit={weightUnit}
        disabled={isDisabled}
        onWeightChange={onWeightChange}
        showControls={false}
      />

      <RepsInput
        reps={reps}
        disabled={isDisabled}
        onRepsChange={onRepsChange}
        showControls={false}
      />

      <CompactSetActions
        isCompleted={isCompleted}
        disabled={disabled}
        canComplete={canComplete}
        onComplete={onComplete}
        onDelete={onDelete}
      />
    </Flex>
  );
}

export { SetRow, SetRowCompact, SET_TYPE_LABELS };
export type { SetType, WeightUnit };
