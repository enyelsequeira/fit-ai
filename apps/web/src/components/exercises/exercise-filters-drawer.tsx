/**
 * ExerciseFiltersDrawer - Mobile-friendly drawer for exercise filters
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
  Drawer,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

import styles from "./exercise-card.module.css";
import {
  createToggleHandler,
  exerciseTypeOptions,
  getCategoryOptions,
  getEquipmentOptions,
} from "./filter-utils";

interface ExerciseFiltersDrawerProps {
  opened: boolean;
  onClose: () => void;
  filters: ExerciseFilters;
  onFilterChange: <K extends keyof ExerciseFilters>(key: K, value: ExerciseFilters[K]) => void;
  onClearFilters: () => void;
  equipmentList: string[];
  muscleGroupsList: string[];
  hasActiveFilters: boolean;
}

export function ExerciseFiltersDrawer({
  opened,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  equipmentList,
  muscleGroupsList,
  hasActiveFilters,
}: ExerciseFiltersDrawerProps) {
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
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" w="100%">
          <Title order={4}>Filters</Title>
        </Group>
      }
      position="right"
      size="sm"
      padding="md"
    >
      <Stack gap="md" h="calc(100vh - 140px)">
        <ScrollArea flex={1}>
          <Stack gap="md">
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
                      <Group gap="xs" justify="space-between">
                        <Group gap="xs">
                          <Icon
                            size={16}
                            style={{
                              color: isActive ? "var(--mantine-color-blue-6)" : color,
                            }}
                          />
                          <Text
                            size="sm"
                            className={styles.filterButtonText}
                            data-active={isActive}
                          >
                            {label}
                          </Text>
                        </Group>
                        {isActive && <IconCheck size={14} color="var(--mantine-color-blue-6)" />}
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
                      <Group justify="space-between">
                        <Text size="sm" className={styles.filterButtonText} data-active={isActive}>
                          {label}
                        </Text>
                        {isActive && <IconCheck size={14} color="var(--mantine-color-blue-6)" />}
                      </Group>
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
                      <Group justify="space-between">
                        <Text size="sm" className={styles.filterButtonText} data-active={isActive}>
                          {label}
                        </Text>
                        {isActive && <IconCheck size={14} color="var(--mantine-color-blue-6)" />}
                      </Group>
                    </UnstyledButton>
                  );
                })}
              </Stack>
            </Box>

            <Divider />

            {/* Muscle Group Filter */}
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Muscle Group
              </Text>
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
                      <Group justify="space-between">
                        <Text
                          size="sm"
                          tt="capitalize"
                          className={styles.filterButtonText}
                          data-active={isActive}
                        >
                          {muscle}
                        </Text>
                        {isActive && <IconCheck size={14} color="var(--mantine-color-blue-6)" />}
                      </Group>
                    </UnstyledButton>
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        </ScrollArea>

        {/* Footer buttons */}
        <Group grow>
          <Button
            variant="outline"
            leftSection={<IconX size={14} />}
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
          >
            Clear all
          </Button>
          <Button onClick={onClose}>Apply Filters</Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
