import type { ReactNode } from "react";

import {
  Button,
  Checkbox,
  Group,
  Select,
  SimpleGrid,
  Slider,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";

import type { SelectOption } from "./preferences-form.types";

// Reusable select field with label
interface FormSelectProps<T extends string> {
  label: string;
  required?: boolean;
  value: T | null | undefined;
  onChange: (value: T | null) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  filterValue?: T;
}

export function FormSelect<T extends string>({
  label,
  required,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  filterValue,
}: FormSelectProps<T>) {
  const filteredOptions = filterValue
    ? options.filter((opt) => opt.value !== filterValue)
    : options;

  return (
    <Select
      label={
        <Text size="sm" fw={500}>
          {label}
          {required && " *"}
        </Text>
      }
      placeholder={placeholder}
      value={value ?? null}
      onChange={(val) => onChange(val as T | null)}
      data={filteredOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
      clearable={!required}
    />
  );
}

// Slider field with label and value display
interface FormSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  valueLabel?: string;
}

export function FormSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  valueLabel,
}: FormSliderProps) {
  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          {label}
        </Text>
        <Text size="sm" fw={500} ff="monospace">
          {valueLabel ?? value}
        </Text>
      </Group>
      <Slider value={value} onChange={onChange} min={min} max={max} step={step} />
    </Stack>
  );
}

// Toggle button group for multi-select items (like days of week)
interface ToggleButtonGroupProps<T extends string> {
  label: string;
  options: SelectOption<T>[];
  selectedValues: T[];
  onChange: (values: T[]) => void;
  columns?: number;
}

export function ToggleButtonGroup<T extends string>({
  label,
  options,
  selectedValues,
  onChange,
  columns,
}: ToggleButtonGroupProps<T>) {
  const handleToggle = (value: T) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  const buttons = options.map((opt) => {
    const isSelected = selectedValues.includes(opt.value);
    return (
      <Button
        key={opt.value}
        variant={isSelected ? "light" : "default"}
        size="xs"
        radius={0}
        onClick={() => handleToggle(opt.value)}
        data-selected={isSelected || undefined}
        styles={{
          root: {
            borderColor: isSelected ? "var(--mantine-color-blue-6)" : undefined,
          },
        }}
      >
        {opt.label}
      </Button>
    );
  });

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        {label}
      </Text>
      {columns ? (
        <SimpleGrid cols={columns} spacing="xs">
          {buttons}
        </SimpleGrid>
      ) : (
        <Group gap="xs">{buttons}</Group>
      )}
    </Stack>
  );
}

// Checkbox grid for equipment/muscle groups
interface CheckboxGridProps {
  label: string;
  options: readonly string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  columns?: { base: number; sm?: number };
  variant?: "default" | "danger";
}

export function CheckboxGrid({
  label,
  options,
  selectedValues,
  onChange,
  columns = { base: 2, sm: 3 },
  variant = "default",
}: CheckboxGridProps) {
  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  const isDanger = variant === "danger";

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        {label}
      </Text>
      <SimpleGrid cols={columns}>
        {options.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <Checkbox
              key={option}
              label={option}
              checked={isSelected}
              onChange={() => handleToggle(option)}
              size="xs"
              tt="capitalize"
              styles={{
                root: {
                  padding: "var(--mantine-spacing-xs)",
                  border: "1px solid",
                  borderColor: isSelected
                    ? isDanger
                      ? "var(--mantine-color-red-6)"
                      : "var(--mantine-color-blue-6)"
                    : "var(--mantine-color-default-border)",
                  backgroundColor: isSelected
                    ? isDanger
                      ? "var(--mantine-color-red-light)"
                      : "var(--mantine-color-blue-light)"
                    : undefined,
                  cursor: "pointer",
                },
              }}
            />
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}

// Form section wrapper
interface FormSectionProps {
  title: string;
  children: ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <Stack gap="md" p="md" style={{ border: "1px solid var(--mantine-color-default-border)" }}>
      <Text size="sm" fw={600}>
        {title}
      </Text>
      {children}
    </Stack>
  );
}

// Form textarea with label
interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
}

export function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  minRows = 3,
}: FormTextareaProps) {
  return (
    <Textarea
      label={
        <Text size="sm" fw={500}>
          {label}
        </Text>
      }
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder={placeholder}
      minRows={minRows}
    />
  );
}
