import type { ExerciseCategory } from "./category-badge";
import type { EquipmentType } from "./equipment-icon";

import { Filter, Grid, List, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
  className?: string;
}

export function ExerciseFiltersBar({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  className,
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
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className="focus-visible:border-ring focus-visible:ring-ring/50 border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground inline-flex h-7 items-center justify-center gap-1 rounded-none border px-2.5 text-xs font-medium transition-all focus-visible:ring-1 outline-none">
          <Filter className="mr-1.5 size-3.5" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px]">
              {activeFiltersCount}
            </Badge>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Category</DropdownMenuLabel>
          {categories.map(({ value, label }) => (
            <DropdownMenuCheckboxItem
              key={value}
              checked={filters.category === value}
              onCheckedChange={(checked) =>
                onFiltersChange({
                  ...filters,
                  category: checked ? value : null,
                })
              }
            >
              {label}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Exercise Type</DropdownMenuLabel>
          {exerciseTypes.map(({ value, label }) => (
            <DropdownMenuCheckboxItem
              key={value}
              checked={filters.exerciseType === value}
              onCheckedChange={(checked) =>
                onFiltersChange({
                  ...filters,
                  exerciseType: checked ? value : null,
                })
              }
            >
              {label}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Equipment</DropdownMenuLabel>
          {equipmentTypes.map(({ value, label }) => (
            <DropdownMenuCheckboxItem
              key={value}
              checked={filters.equipment === value}
              onCheckedChange={(checked) =>
                onFiltersChange({
                  ...filters,
                  equipment: checked ? value : null,
                })
              }
            >
              {label}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={filters.customOnly}
            onCheckedChange={(checked) =>
              onFiltersChange({
                ...filters,
                customOnly: Boolean(checked),
              })
            }
          >
            My Exercises Only
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
          Clear filters
          <X className="ml-1 size-3" />
        </Button>
      )}

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="icon-sm"
          onClick={() => onViewModeChange("grid")}
        >
          <Grid className="size-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="icon-sm"
          onClick={() => onViewModeChange("list")}
        >
          <List className="size-4" />
        </Button>
      </div>
    </div>
  );
}

interface CategoryTabsProps {
  selectedCategory: ExerciseCategory | null;
  onCategoryChange: (category: ExerciseCategory | null) => void;
  className?: string;
}

export function CategoryTabs({ selectedCategory, onCategoryChange, className }: CategoryTabsProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      <Button
        variant={selectedCategory === null ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onCategoryChange(null)}
      >
        All
      </Button>
      {categories.map(({ value, label }) => {
        const config = categoryConfig[value];
        return (
          <Button
            key={value}
            variant={selectedCategory === value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onCategoryChange(value)}
            className="gap-1.5"
          >
            <config.icon className={cn("size-3.5", config.color)} />
            {label}
          </Button>
        );
      })}
    </div>
  );
}
