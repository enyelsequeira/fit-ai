import type { Icon } from "@tabler/icons-react";

import { Box, Stack, Text, ThemeIcon, Title } from "@mantine/core";

interface EmptyStateProps {
  icon?: Icon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function EmptyState({ icon: IconComponent, title, description, action }: EmptyStateProps) {
  return (
    <Stack align="center" justify="center" gap="md" py="xl">
      {IconComponent && (
        <ThemeIcon size="xl" radius="xl" variant="light" color="gray">
          <IconComponent size={24} />
        </ThemeIcon>
      )}
      <Stack align="center" gap="xs">
        <Title order={4} size="sm" fw={500}>
          {title}
        </Title>
        {description && (
          <Text size="xs" c="dimmed" ta="center">
            {description}
          </Text>
        )}
      </Stack>
      {action && <Box>{action}</Box>}
    </Stack>
  );
}

export { EmptyState };
