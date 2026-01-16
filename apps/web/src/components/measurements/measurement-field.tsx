/**
 * MeasurementField - Reusable number input field for body measurements
 * Provides consistent styling and configuration for measurement inputs
 */

import { NumberInput } from "@mantine/core";

import type { MeasurementFieldName, MeasurementForm } from "./measurement-types";

interface MeasurementFieldProps {
  form: MeasurementForm;
  name: MeasurementFieldName;
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  decimalScale?: number;
  step?: number;
  suffix?: string;
  leftSection?: React.ReactNode;
}

export function MeasurementField({
  form,
  name,
  label,
  placeholder,
  min = 0,
  max = 300,
  decimalScale = 1,
  step = 0.5,
  suffix,
  leftSection,
}: MeasurementFieldProps) {
  return (
    <NumberInput
      label={label}
      placeholder={placeholder ?? label}
      min={min}
      max={max}
      decimalScale={decimalScale}
      step={step}
      suffix={suffix}
      leftSection={leftSection}
      {...form.getInputProps(name)}
    />
  );
}
