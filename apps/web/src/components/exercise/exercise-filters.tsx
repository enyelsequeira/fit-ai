import type { ExerciseCategory } from "./category-badge";
import type { EquipmentType } from "./equipment-icon";

import { ActionIcon, Badge, Button, Checkbox, Group, Menu, Text } from "@mantine/core";
import { IconFilter, IconLayoutGrid, IconList, IconX } from "@tabler/icons-react";
import { useState } from "react";

import { categoryConfig } from "./category-badge";
import { equipmentConfig } from "./equipment-icon";

export type ExerciseType = "strength" | "cardio" | "flexibility";
export type ViewMode = "grid" | "list";

const exerciseTypes: { value: ExerciseType; label: string }[] = [
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "flexibility", label: "Flexibility" },
];

const categories = Object.entries(categoryConfig).map(([key, config]) => ({
  value: key as ExerciseCategory,
  label: config.label,
}));

const equipmentTypes = Object.entries(equipmentConfig).map(([key, config]) => ({
  value: key as NonNullable<EquipmentType>,
  label: config.label,
}));

export interface ExerciseFilters {
  category: ExerciseCategory | null;
  exerciseType: ExerciseType | null;
  equipment: NonNullable<EquipmentType> | null;
  customOnly: boolean;
}

interface ExerciseFiltersProps {
  filters: ExerciseFilters;
  onFiltersChange: (filters: ExerciseFilters) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ExerciseFiltersBar({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
}: ExerciseFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.category,
    filters.exerciseType,
    filters.equipment,
    filters.customOnly,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      category: null,
      exerciseType: null,
      equipment: null,
      customOnly: false,
    });
  };

  return (
    <Group gap="xs" wrap="wrap">
      <Menu opened={isOpen} onChange={setIsOpen} position="bottom-start" withinPortal>
        <Menu.Target>
          <Button
            variant="default"
            size="xs"
            leftSection={<IconFilter size={14} />}
            rightSection={
              activeFiltersCount > 0 ? (
                <Badge size="xs" variant="filled" circle>
                  {activeFiltersCount}
                </Badge>
              ) : null
            }
          >
            Filters
          </Button>
        </Menu.Target>
        <Menu.Dropdown miw={220}>
          <Menu.Label>Category</Menu.Label>
          {categories.map(({ value, label }) => (
            <Menu.Item
              key={value}
              leftSection={
                <Checkbox
                  checked={filters.category === value}
                  onChange={() => {}}
                  size="xs"
                  styles={{ input: { cursor: "pointer" } }}
                />
              }
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  category: filters.category === value ? null : value,
                })
              }
            >
              {label}
            </Menu.Item>
          ))}

          <Menu.Divider />
          <Menu.Label>Exercise Type</Menu.Label>
          {exerciseTypes.map(({ value, label }) => (
            <Menu.Item
              key={value}
              leftSection={
                <Checkbox
                  checked={filters.exerciseType === value}
                  onChange={() => {}}
                  size="xs"
                  styles={{ input: { cursor: "pointer" } }}
                />
              }
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  exerciseType: filters.exerciseType === value ? null : value,
                })
              }
            >
              {label}
            </Menu.Item>
          ))}

          <Menu.Divider />
          <Menu.Label>Equipment</Menu.Label>
          {equipmentTypes.map(({ value, label }) => (
            <Menu.Item
              key={value}
              leftSection={
                <Checkbox
                  checked={filters.equipment === value}
                  onChange={() => {}}
                  size="xs"
                  styles={{ input: { cursor: "pointer" } }}
                />
              }
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  equipment: filters.equipment === value ? null : value,
                })
              }
            >
              {label}
            </Menu.Item>
          ))}

          <Menu.Divider />
          <Menu.Item
            leftSection={
              <Checkbox
                checked={filters.customOnly}
                onChange={() => {}}
                size="xs"
                styles={{ input: { cursor: "pointer" } }}
              />
            }
            onClick={() =>
              onFiltersChange({
                ...filters,
                customOnly: !filters.customOnly,
              })
            }
          >
            My Exercises Only
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {activeFiltersCount > 0 && (
        <Button
          variant="subtle"
          size="xs"
          color="gray"
          rightSection={<IconX size={12} />}
          onClick={clearFilters}
        >
          Clear filters
        </Button>
      )}

      <Group gap={4} ml="auto">
        <ActionIcon
          variant={viewMode === "grid" ? "filled" : "subtle"}
          size="sm"
          onClick={() => onViewModeChange("grid")}
          aria-label="Grid view"
        >
          <IconLayoutGrid size={16} />
        </ActionIcon>
        <ActionIcon
          variant={viewMode === "list" ? "filled" : "subtle"}
          size="sm"
          onClick={() => onViewModeChange("list")}
          aria-label="List view"
        >
          <IconList size={16} />
        </ActionIcon>
      </Group>
    </Group>
  );
}

interface CategoryTabsProps {
  selectedCategory: ExerciseCategory | null;
  onCategoryChange: (category: ExerciseCategory | null) => void;
}

export function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <Group gap="xs" wrap="wrap">
      <Button
        variant={selectedCategory === null ? "filled" : "subtle"}
        size="xs"
        onClick={() => onCategoryChange(null)}
      >
        All
      </Button>
      {categories.map(({ value, label }) => {
        const config = categoryConfig[value];
        return (
          <Button
            key={value}
            variant={selectedCategory === value ? "filled" : "subtle"}
            size="xs"
            onClick={() => onCategoryChange(value)}
            leftSection={
              <config.icon
                size={14}
                style={{ color: selectedCategory === value ? undefined : config.color }}
              />
            }
          >
            {label}
          </Button>
        );
      })}
    </Group>
  );
}
