/**
 * Shared state view components for loading, error, and empty states.
 * Use these instead of duplicating state handling in each view.
 *
 * NOTE: Consider using the newer fit-ai-* components for new implementations:
 * - FitAiPageHeader (fit-ai-page-header/)
 * - FitAiStatsRow (fit-ai-stats-row/)
 */

import type { ReactNode } from "react";

import { Alert, Box, Button, Center, Flex, Group, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle, IconInbox, IconRefresh } from "@tabler/icons-react";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

/**
 * Reusable error state component with optional retry button.
 *
 * @example
 * <ErrorState />
 * <ErrorState title="Failed to load workouts" message={error.message} onRetry={refetch} />
 */
export function ErrorState({
  title = "Error loading data",
  message = "There was an error loading this content. Please try again.",
  onRetry,
  retryLabel = "Retry",
}: ErrorStateProps) {
  return (
    <Alert
      color="red"
      title={title}
      icon={<IconAlertCircle size={20} aria-hidden="true" />}
      data-state="error"
    >
      <Text size="sm">{message}</Text>
      {onRetry && (
        <Button
          variant="light"
          color="red"
          size="xs"
          mt="sm"
          leftSection={<IconRefresh size={14} aria-hidden="true" />}
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      )}
    </Alert>
  );
}

type EmptyStateProps = {
  icon?: ReactNode;
  title?: string;
  message?: string;
  action?: ReactNode;
};

/**
 * Reusable empty state component for when there's no data.
 *
 * @example
 * <EmptyState />
 * <EmptyState
 *   icon={<IconDumbbell size={48} />}
 *   title="No workouts yet"
 *   message="Create your first workout to get started"
 *   action={<Button>Create Workout</Button>}
 * />
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
        <Box c="dimmed">{icon ?? <IconInbox size={48} stroke={1.5} aria-hidden="true" />}</Box>
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

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

/**
 * Reusable page header component.
 *
 * NOTE: For new implementations, consider using FitAiPageHeader instead,
 * which provides more features like search, mobile filter, and stats.
 *
 * @example
 * <PageHeader title="Workouts" />
 * <PageHeader
 *   title="My Templates"
 *   description="Manage your workout templates"
 *   actions={<Button>Create Template</Button>}
 * />
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

/**
 * Icon style configuration for StatCard
 */
type StatCardIconStyle = {
  bg?: string;
  color?: string;
};

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  iconStyle?: StatCardIconStyle;
};

/**
 * Reusable stat card for summary statistics.
 * Uses Mantine CSS variables for theming.
 *
 * NOTE: For new implementations with multiple stats, consider using
 * FitAiStatsRow instead, which provides a responsive grid layout.
 *
 * @example
 * <StatCard
 *   icon={<IconDumbbell size={20} />}
 *   label="Total Workouts"
 *   value={42}
 * />
 * <StatCard
 *   icon={<IconFlame size={20} />}
 *   label="Calories"
 *   value="1,234"
 *   trend={12}
 *   iconStyle={{ bg: "var(--mantine-color-orange-light)", color: "var(--mantine-color-orange-6)" }}
 * />
 */
export function StatCard({ icon, label, value, trend, iconStyle }: StatCardProps) {
  const { bg = "var(--mantine-color-blue-light)", color = "var(--mantine-color-blue-6)" } =
    iconStyle ?? {};

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
          backgroundColor: bg,
          color: color,
        }}
        aria-hidden="true"
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
