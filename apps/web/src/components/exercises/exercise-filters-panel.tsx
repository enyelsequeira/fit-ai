/**
 * ExerciseFiltersPanel - Sidebar filter controls for exercises
 * Displays category, type, equipment, and muscle group filters
 */

import type { ExerciseCategory } from "@/components/exercise/category-badge";
import type { EquipmentType } from "@/components/exercise/equipment-icon";
import type { ExerciseFilters, ExerciseType } from "./use-exercises-data";

import { useMemo } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";

import styles from "./exercise-card.module.css";
import {
  createToggleHandler,
  exerciseTypeOptions,
  getCategoryOptions,
  getEquipmentOptions,
} from "./filter-utils";

interface ExerciseFiltersPanelProps {
  filters: ExerciseFilters;
  onFilterChange: <K extends keyof ExerciseFilters>(key: K, value: ExerciseFilters[K]) => void;
  onClearFilters: () => void;
  equipmentList: string[];
  muscleGroupsList: string[];
  hasActiveFilters: boolean;
}

export function ExerciseFiltersPanel({
  filters,
  onFilterChange,
  onClearFilters,
  equipmentList,
  muscleGroupsList,
  hasActiveFilters,
}: ExerciseFiltersPanelProps) {
  const categories = useMemo(() => getCategoryOptions(), []);
  const equipmentOptions = useMemo(() => getEquipmentOptions(equipmentList), [equipmentList]);

  const handleCategoryClick = createToggleHandler("category", filters.category, onFilterChange);
  const handleExerciseTypeClick = createToggleHandler(
    "exerciseType",
    filters.exerciseType,
    onFilterChange,
  );
  const handleEquipmentClick = createToggleHandler("equipment", filters.equipment, onFilterChange);

  const handleMuscleGroupClick = (muscle: string) => {
    onFilterChange("muscleGroup", filters.muscleGroup === muscle ? null : muscle);
  };

  const handleCustomOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange("customOnly", e.currentTarget.checked);
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Title order={5}>Filters</Title>
          {hasActiveFilters && (
            <Button
              variant="subtle"
              size="xs"
              color="gray"
              rightSection={<IconX size={12} />}
              onClick={onClearFilters}
            >
              Clear all
            </Button>
          )}
        </Group>

        <Divider />

        {/* My Exercises Toggle */}
        <Checkbox
          label="My custom exercises only"
          checked={filters.customOnly}
          onChange={handleCustomOnlyChange}
        />

        <Divider />

        {/* Category Filter */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Category
          </Text>
          <Stack gap={4}>
            {categories.map(({ value, label, icon: Icon, color }) => {
              const isActive = filters.category === value;
              return (
                <UnstyledButton
                  key={value}
                  onClick={() => handleCategoryClick(value)}
                  className={styles.filterButton}
                  data-active={isActive}
                >
                  <Group gap="xs">
                    <Icon
                      size={16}
                      style={{
                        color: isActive ? "var(--mantine-color-blue-6)" : color,
                      }}
                    />
                    <Text size="sm" className={styles.filterButtonText} data-active={isActive}>
                      {label}
                    </Text>
                  </Group>
                </UnstyledButton>
              );
            })}
          </Stack>
        </Box>

        <Divider />

        {/* Exercise Type Filter */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Exercise Type
          </Text>
          <Stack gap={4}>
            {exerciseTypeOptions.map(({ value, label }) => {
              const isActive = filters.exerciseType === value;
              return (
                <UnstyledButton
                  key={value}
                  onClick={() => handleExerciseTypeClick(value)}
                  className={styles.filterButton}
                  data-active={isActive}
                >
                  <Text size="sm" className={styles.filterButtonText} data-active={isActive}>
                    {label}
                  </Text>
                </UnstyledButton>
              );
            })}
          </Stack>
        </Box>

        <Divider />

        {/* Equipment Filter */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Equipment
          </Text>
          <ScrollArea.Autosize mah={200}>
            <Stack gap={4}>
              {equipmentOptions.map(({ value, label }) => {
                const isActive = filters.equipment === value;
                return (
                  <UnstyledButton
                    key={value}
                    onClick={() => handleEquipmentClick(value)}
                    className={styles.filterButton}
                    data-active={isActive}
                  >
                    <Text size="sm" className={styles.filterButtonText} data-active={isActive}>
                      {label}
                    </Text>
                  </UnstyledButton>
                );
              })}
            </Stack>
          </ScrollArea.Autosize>
        </Box>

        <Divider />

        {/* Muscle Group Filter */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Muscle Group
          </Text>
          <ScrollArea.Autosize mah={250}>
            <Stack gap={4}>
              {muscleGroupsList.map((muscle) => {
                const isActive = filters.muscleGroup === muscle;
                return (
                  <UnstyledButton
                    key={muscle}
                    onClick={() => handleMuscleGroupClick(muscle)}
                    className={styles.filterButton}
                    data-active={isActive}
                  >
                    <Text
                      size="sm"
                      tt="capitalize"
                      className={styles.filterButtonText}
                      data-active={isActive}
                    >
                      {muscle}
                    </Text>
                  </UnstyledButton>
                );
              })}
            </Stack>
          </ScrollArea.Autosize>
        </Box>
      </Stack>
    </Paper>
  );
}
