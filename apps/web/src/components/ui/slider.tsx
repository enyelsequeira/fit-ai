import type { SliderProps as MantineSliderProps } from "@mantine/core";

import { Slider as MantineSlider, Text } from "@mantine/core";
import { forwardRef, useState } from "react";

interface SliderProps extends Omit<MantineSliderProps, "value" | "defaultValue" | "onChange"> {
  value?: number[];
  defaultValue?: number[];
  showValue?: boolean;
  onValueChange?: (value: number[]) => void;
}

const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      defaultValue,
      showValue = false,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      ...props
    },
    ref,
  ) => {
    const initialValue = value?.[0] ?? defaultValue?.[0] ?? min;
    const [currentValue, setCurrentValue] = useState(initialValue);

    const handleChange = (newValue: number) => {
      setCurrentValue(newValue);
      onValueChange?.([newValue]);
    };

    return (
      <div ref={ref} style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
        <MantineSlider
          value={value?.[0] ?? currentValue}
          defaultValue={defaultValue?.[0]}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          style={{ flex: 1 }}
          size="sm"
          {...props}
        />
        {showValue && (
          <Text
            size="xs"
            c="dimmed"
            style={{ minWidth: "2ch", fontVariantNumeric: "tabular-nums" }}
          >
            {value?.[0] ?? currentValue}
          </Text>
        )}
      </div>
    );
  },
);

Slider.displayName = "Slider";

function SliderOutput({ children }: { children?: React.ReactNode }) {
  return (
    <Text size="xs" c="dimmed" style={{ fontVariantNumeric: "tabular-nums" }}>
      {children}
    </Text>
  );
}

export { Slider, SliderOutput };
