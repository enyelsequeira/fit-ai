/**
 * RecordsFilters - Filter controls for personal records (search, type filter)
 */

import { IconSearch, IconX } from "@tabler/icons-react";
import { ActionIcon, Box, Button, Flex, SegmentedControl, TextInput } from "@mantine/core";
import type { RecordTypeFilter } from "./use-records-data";
import styles from "./records-filters.module.css";

interface RecordsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  recordTypeFilter: RecordTypeFilter;
  onRecordTypeChange: (value: RecordTypeFilter) => void;
  hasActiveFilters?: boolean;
}

// Simplified type options for SegmentedControl
const TYPE_OPTIONS: { value: RecordTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "one_rep_max", label: "1RM" },
  { value: "max_weight", label: "Weight" },
  { value: "max_reps", label: "Reps" },
  { value: "max_volume", label: "Volume" },
];

export function RecordsFilters({
  searchQuery,
  onSearchChange,
  recordTypeFilter,
  onRecordTypeChange,
  hasActiveFilters = false,
}: RecordsFiltersProps) {
  const handleClearSearch = () => {
    onSearchChange("");
  };

  const handleClearFilters = () => {
    onSearchChange("");
    onRecordTypeChange("all");
  };

  return (
    <Box className={styles.container} data-has-filters={hasActiveFilters}>
      <Flex
        direction={{ base: "column", sm: "row" }}
        gap="sm"
        align={{ base: "stretch", sm: "flex-end" }}
      >
        {/* Search Input */}
        <Box flex={1} maw={320}>
          <TextInput
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchQuery && (
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <IconX size={14} />
                </ActionIcon>
              )
            }
            classNames={{ input: styles.searchInput }}
          />
        </Box>

        {/* Record Type Filter */}
        <SegmentedControl
          value={recordTypeFilter}
          onChange={(value) => onRecordTypeChange(value as RecordTypeFilter)}
          data={TYPE_OPTIONS}
          size="sm"
          classNames={{
            root: styles.segmentedRoot,
            indicator: styles.segmentedIndicator,
          }}
        />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconX size={14} />}
            onClick={handleClearFilters}
            className={styles.clearButton}
          >
            Clear
          </Button>
        )}
      </Flex>
    </Box>
  );
}
