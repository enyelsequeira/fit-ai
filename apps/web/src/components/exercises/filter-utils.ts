/**
 * Shared utilities for exercise filter components
 * Contains common data transformations and filter options
 */

import type { ExerciseCategory } from "@/components/exercise/category-badge";
import type { EquipmentType } from "@/components/exercise/equipment-icon";
import type { ExerciseFilters, ExerciseType } from "./use-exercises-data";

import { categoryConfig } from "@/components/exercise/category-badge";
import { equipmentConfig } from "@/components/exercise/equipment-icon";

export interface CategoryOption {
  value: ExerciseCategory;
  label: string;
  icon: (typeof categoryConfig)[ExerciseCategory]["icon"];
  color: string;
}

export interface EquipmentOption {
  value: NonNullable<EquipmentType>;
  label: string;
}

export interface ExerciseTypeOption {
  value: ExerciseType;
  label: string;
}

/** Exercise type options */
export const exerciseTypeOptions: ExerciseTypeOption[] = [
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "flexibility", label: "Flexibility" },
];

/** Get category options from config */
export function getCategoryOptions(): CategoryOption[] {
  return Object.entries(categoryConfig).map(([key, config]) => ({
    value: key as ExerciseCategory,
    label: config.label,
    icon: config.icon,
    color: config.color,
  }));
}

/** Get equipment options, filtered by available list if provided */
export function getEquipmentOptions(availableList: string[] = []): EquipmentOption[] {
  const filteredEquipment = Object.entries(equipmentConfig)
    .filter(([key]) => availableList.length === 0 || availableList.includes(key))
    .map(([key, config]) => ({
      value: key as NonNullable<EquipmentType>,
      label: config.label,
    }));

  return filteredEquipment.length > 0
    ? filteredEquipment
    : Object.entries(equipmentConfig).map(([key, config]) => ({
        value: key as NonNullable<EquipmentType>,
        label: config.label,
      }));
}

/** Create toggle handler for single-select filters */
export function createToggleHandler<K extends keyof ExerciseFilters>(
  key: K,
  currentValue: ExerciseFilters[K],
  onChange: (key: K, value: ExerciseFilters[K]) => void,
) {
  return (value: NonNullable<ExerciseFilters[K]>) => {
    onChange(key, currentValue === value ? (null as ExerciseFilters[K]) : value);
  };
}
