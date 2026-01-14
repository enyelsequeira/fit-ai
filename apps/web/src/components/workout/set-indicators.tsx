import type { SetType, WeightUnit } from "./set-row-utils";

import { Box, Select, Text } from "@mantine/core";

import {
  formatPreviousPerformance,
  getSetTypeSelectData,
  SET_TYPE_COLORS,
  SET_TYPE_MANTINE_COLORS,
} from "./set-row-utils";

const SET_TYPE_SELECT_STYLES = {
  input: {
    height: 28,
    minHeight: 28,
    paddingLeft: 6,
    paddingRight: 6,
  },
};

interface SetTypeSelectProps {
  setType: SetType;
  disabled: boolean;
  onSetTypeChange: (value: SetType) => void;
}

interface PreviousPerformanceProps {
  previousWeight: number | null | undefined;
  previousReps: number | null | undefined;
  weightUnit: WeightUnit;
  compact?: boolean;
}

function SetTypeSelect({ setType, disabled, onSetTypeChange }: SetTypeSelectProps) {
  const handleChange = (value: string | null) => {
    if (value) {
      onSetTypeChange(value as SetType);
    }
  };

  return (
    <Box style={{ minWidth: 60 }}>
      <Select
        value={setType}
        onChange={handleChange}
        disabled={disabled}
        data={getSetTypeSelectData()}
        size="xs"
        w={64}
        styles={{
          ...SET_TYPE_SELECT_STYLES,
          input: {
            ...SET_TYPE_SELECT_STYLES.input,
            color: SET_TYPE_COLORS[setType] || undefined,
          },
        }}
        comboboxProps={{ withinPortal: true }}
      />
    </Box>
  );
}

function PreviousPerformance({
  previousWeight,
  previousReps,
  weightUnit,
  compact = false,
}: PreviousPerformanceProps) {
  const formatted = formatPreviousPerformance(previousWeight, previousReps, weightUnit, compact);

  if (compact) {
    return (
      <Text fz="xs" c="dimmed" style={{ minWidth: 50 }}>
        {formatted ?? "-"}
      </Text>
    );
  }

  return (
    <Text fz="xs" c="dimmed" ta="center" style={{ minWidth: 70 }}>
      {formatted ? <span>{formatted}</span> : <span style={{ opacity: 0.5 }}>-</span>}
    </Text>
  );
}

function SetNumberIndicator({ setNumber, setType }: { setNumber: number; setType: SetType }) {
  return (
    <Text w={24} ta="center" fz="xs" fw={500} c={SET_TYPE_MANTINE_COLORS[setType]}>
      {setNumber}
    </Text>
  );
}

export { SetTypeSelect, PreviousPerformance, SetNumberIndicator };
