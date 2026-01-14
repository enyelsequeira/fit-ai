/**
 * ExercisesPagination - Pagination controls for exercises list
 */

import { Box, Group, Pagination, Paper, Text } from "@mantine/core";

interface ExercisesPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total: number;
  pageSize: number;
}

export function ExercisesPagination({
  page,
  totalPages,
  onPageChange,
  total,
  pageSize,
}: ExercisesPaginationProps) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <Paper withBorder p="sm" radius="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Text size="sm" c="dimmed">
          Showing {start.toLocaleString()} - {end.toLocaleString()} of {total.toLocaleString()}{" "}
          exercises
        </Text>

        <Pagination
          value={page}
          onChange={onPageChange}
          total={totalPages}
          size="sm"
          withEdges
          boundaries={1}
          siblings={1}
        />
      </Group>
    </Paper>
  );
}
