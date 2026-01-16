/**
 * ExerciseSearchBar - Search input and view controls for exercises
 */

import type { ViewMode } from "./use-exercises-data";

import { ActionIcon, Badge, Box, Button, Group, Paper, TextInput } from "@mantine/core";
import { IconFilter, IconLayoutGrid, IconList, IconSearch, IconX } from "@tabler/icons-react";

interface ExerciseSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeFiltersCount: number;
  onOpenFilters: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  isMobile: boolean;
}

export function ExerciseSearchBar({
  searchQuery,
  onSearchChange,
  onClearSearch,
  viewMode,
  onViewModeChange,
  activeFiltersCount,
  onOpenFilters,
  onClearFilters,
  hasActiveFilters,
  isMobile,
}: ExerciseSearchBarProps) {
  return (
    <Paper withBorder p="sm" radius="md">
      <Group gap="sm" wrap="wrap">
        {/* Search input */}
        <Box flex={1} miw={200}>
          <TextInput
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchQuery ? (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={onClearSearch}
                  aria-label="Clear search"
                >
                  <IconX size={14} />
                </ActionIcon>
              ) : null
            }
          />
        </Box>

        {/* Mobile filter button */}
        {isMobile && (
          <Button
            variant="default"
            leftSection={<IconFilter size={16} />}
            rightSection={
              activeFiltersCount > 0 ? (
                <Badge size="xs" variant="filled" circle>
                  {activeFiltersCount}
                </Badge>
              ) : null
            }
            onClick={onOpenFilters}
          >
            Filters
          </Button>
        )}

        {/* Clear filters button (shown when filters are active) */}
        {hasActiveFilters && !isMobile && (
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            rightSection={<IconX size={12} />}
            onClick={onClearFilters}
          >
            Clear filters ({activeFiltersCount})
          </Button>
        )}

        {/* View mode toggle */}
        <Group gap={4}>
          <ActionIcon
            variant={viewMode === "grid" ? "filled" : "subtle"}
            size="lg"
            onClick={() => onViewModeChange("grid")}
            aria-label="Grid view"
          >
            <IconLayoutGrid size={18} />
          </ActionIcon>
          <ActionIcon
            variant={viewMode === "list" ? "filled" : "subtle"}
            size="lg"
            onClick={() => onViewModeChange("list")}
            aria-label="List view"
          >
            <IconList size={18} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
}
