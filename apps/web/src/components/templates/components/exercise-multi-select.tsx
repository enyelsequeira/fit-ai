/**
 * ExerciseMultiSelect - A searchable multi-select component for exercises
 * Uses Mantine's MultiSelect with custom renderOption for rich exercise display
 */

import type { MultiSelectProps } from "@mantine/core";

import { useState, useMemo } from "react";
import { MultiSelect, Group, Text, Center } from "@mantine/core";
import { IconBarbell } from "@tabler/icons-react";

import { useExerciseSearch } from "../queries/use-queries";

interface ExerciseMultiSelectProps {
  value: number[];
  onChange: (exerciseIds: number[]) => void;
  excludeIds?: number[];
  label?: string;
  placeholder?: string;
}

interface ExerciseOption {
  value: string;
  label: string;
  category: string;
  primaryMuscle: string;
}

export function ExerciseMultiSelect({
  value,
  onChange,
  excludeIds = [],
  label = "Exercises",
  placeholder = "Search and select exercises...",
}: ExerciseMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch exercises using the shared hook (handles debouncing internally)
  const { data: exercisesData, isLoading } = useExerciseSearch({
    search: searchQuery,
    limit: 50,
  });

  // Map exercises to MultiSelect data format, filtering out excluded IDs
  const exerciseOptions: ExerciseOption[] = useMemo(() => {
    const exercises = exercisesData?.exercises ?? [];
    const allExcludedIds = new Set([...excludeIds, ...value]);

    return exercises
      .filter((exercise) => !allExcludedIds.has(exercise.id))
      .map((exercise) => ({
        value: String(exercise.id),
        label: exercise.name,
        category: exercise.category,
        primaryMuscle: exercise.muscleGroups[0] ?? exercise.exerciseType,
      }));
  }, [exercisesData?.exercises, excludeIds, value]);

  // Keep track of selected exercises to maintain their labels
  const [selectedExercises, setSelectedExercises] = useState<Map<string, ExerciseOption>>(
    new Map(),
  );

  // Combine selected exercises with search results for display
  const allOptions = useMemo(() => {
    const options = [...exerciseOptions];

    // Add selected exercises that might not be in current search results
    for (const id of value) {
      const stringId = String(id);
      if (!options.some((opt) => opt.value === stringId)) {
        const cached = selectedExercises.get(stringId);
        if (cached) {
          options.push(cached);
        }
      }
    }

    return options;
  }, [exerciseOptions, value, selectedExercises]);

  // Custom render option for rich exercise display
  const renderOption: MultiSelectProps["renderOption"] = ({ option }) => {
    const exerciseOption = allOptions.find((opt) => opt.value === option.value);

    return (
      <Group gap="sm" wrap="nowrap">
        <Center
          w={32}
          h={32}
          style={{
            backgroundColor: "var(--mantine-color-blue-light)",
            borderRadius: "var(--mantine-radius-sm)",
            flexShrink: 0,
          }}
        >
          <IconBarbell size={16} style={{ color: "var(--mantine-color-blue-6)" }} />
        </Center>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={500} truncate>
            {option.label}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {exerciseOption?.category ?? "Exercise"} - {exerciseOption?.primaryMuscle ?? ""}
          </Text>
        </div>
      </Group>
    );
  };

  // Handle value changes and cache selected exercise info
  const handleChange = (selectedValues: string[]) => {
    // Update cache for newly selected exercises
    for (const val of selectedValues) {
      if (!selectedExercises.has(val)) {
        const option = allOptions.find((opt) => opt.value === val);
        if (option) {
          setSelectedExercises((prev) => new Map(prev).set(val, option));
        }
      }
    }

    // Convert string IDs back to numbers
    const numericIds = selectedValues.map((v) => parseInt(v, 10));
    onChange(numericIds);
  };

  return (
    <MultiSelect
      label={label}
      placeholder={placeholder}
      data={allOptions}
      value={value.map(String)}
      onChange={handleChange}
      searchable
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      renderOption={renderOption}
      hidePickedOptions
      nothingFoundMessage={
        isLoading ? "Searching..." : searchQuery ? "No exercises found" : "Type to search exercises"
      }
      maxDropdownHeight={300}
      comboboxProps={{
        transitionProps: { transition: "pop", duration: 200 },
      }}
    />
  );
}
