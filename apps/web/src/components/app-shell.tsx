import type { ReactNode } from "react";

import { Box, Container, Flex, Stack, Text, Title } from "@mantine/core";

import Header from "./header";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  /** Whether to use full width or container width */
  fullWidth?: boolean;
  /** Whether to include padding */
  noPadding?: boolean;
}

export default function AppShell({
  children,
  fullWidth = false,
  noPadding = false,
}: AppShellProps) {
  return (
    <Box mih="100vh" bg="var(--mantine-color-body)">
      <Header />
      {fullWidth ? (
        <Box
          component="main"
          style={{ flex: 1 }}
          px={noPadding ? 0 : "md"}
          py={noPadding ? 0 : "lg"}
        >
          {children}
        </Box>
      ) : (
        <Container component="main" px={noPadding ? 0 : "md"} py={noPadding ? 0 : "lg"}>
          {children}
        </Container>
      )}
    </Box>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      align={{ sm: "center" }}
      justify={{ sm: "space-between" }}
      gap="md"
      pb="lg"
    >
      <Stack gap={4}>
        <Title order={1} fz={24} fw={700} lts={-0.5}>
          {title}
        </Title>
        {description && (
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        )}
      </Stack>
      {actions && (
        <Flex align="center" gap="xs">
          {actions}
        </Flex>
      )}
    </Flex>
  );
}
