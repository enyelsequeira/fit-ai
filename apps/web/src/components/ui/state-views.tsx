/**
 * Shared state view components for loading, error, and empty states
 * Use these instead of duplicating state handling in each view
 */

import type { ReactNode } from "react";
import { Alert, Box, Button, Center, Flex, Group, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle, IconInbox, IconRefresh } from "@tabler/icons-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Reusable error state component with optional retry button
 */
export function ErrorState({
  title = "Error loading data",
  message = "There was an error loading this content. Please try again.",
  onRetry,
  retryLabel = "Retry",
}: ErrorStateProps) {
  return (
    <Alert color="red" title={title} icon={<IconAlertCircle size={20} />} data-state="error">
      <Text size="sm">{message}</Text>
      {onRetry && (
        <Button
          variant="light"
          color="red"
          size="xs"
          mt="sm"
          leftSection={<IconRefresh size={14} />}
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      )}
    </Alert>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  message?: string;
  action?: ReactNode;
}

/**
 * Reusable empty state component for when there's no data
 */
export function EmptyState({
  icon,
  title = "No data found",
  message = "There's nothing to display here yet.",
  action,
}: EmptyStateProps) {
  return (
    <Center py="xl" data-state="empty">
      <Stack align="center" gap="md">
        <Box c="dimmed">{icon ?? <IconInbox size={48} stroke={1.5} />}</Box>
        <Stack align="center" gap="xs">
          <Title order={4} c="dimmed">
            {title}
          </Title>
          <Text size="sm" c="dimmed" ta="center" maw={300}>
            {message}
          </Text>
        </Stack>
        {action}
      </Stack>
    </Center>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Reusable page header component
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Group
      justify="space-between"
      align="flex-start"
      wrap="wrap"
      gap="md"
      data-component="page-header"
    >
      <Box>
        <Title order={2}>{title}</Title>
        {description && (
          <Text size="sm" c="dimmed" mt={4}>
            {description}
          </Text>
        )}
      </Box>
      {actions && <Box>{actions}</Box>}
    </Group>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  iconBg?: string;
  iconColor?: string;
}

/**
 * Reusable stat card for summary statistics
 * Uses Mantine CSS variables for theming
 */
export function StatCard({
  icon,
  label,
  value,
  trend,
  iconBg = "var(--mantine-color-blue-light)",
  iconColor = "var(--mantine-color-blue-6)",
}: StatCardProps) {
  return (
    <Flex
      align="center"
      gap="md"
      p="md"
      style={{
        borderRadius: "var(--mantine-radius-md)",
        border: "1px solid var(--mantine-color-default-border)",
        backgroundColor: "var(--mantine-color-body)",
      }}
      data-component="stat-card"
    >
      <Center
        w={40}
        h={40}
        style={{
          borderRadius: "var(--mantine-radius-md)",
          backgroundColor: iconBg,
          color: iconColor,
        }}
      >
        {icon}
      </Center>
      <Box flex={1}>
        <Group justify="space-between" align="center">
          <Text size="xl" fw={700}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </Text>
          {trend !== undefined && trend !== 0 && (
            <Text size="xs" c={trend > 0 ? "teal" : "red"} fw={500}>
              {trend > 0 ? "+" : ""}
              {trend.toFixed(0)}%
            </Text>
          )}
        </Group>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
      </Box>
    </Flex>
  );
}
