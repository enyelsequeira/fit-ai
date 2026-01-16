import type { ReactNode } from "react";

import { Box, Flex, Stack, Text } from "@mantine/core";

import styles from "./workout-frequency.module.css";

interface StatItemProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  iconColor?: string;
}

export function StatItem({ icon, label, value, iconColor }: StatItemProps) {
  return (
    <Flex align="center" gap="xs">
      <Box className={styles.statIcon} style={{ color: iconColor }}>
        {icon}
      </Box>
      <Stack gap={0}>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
        <Text size="sm" fw={600}>
          {value}
        </Text>
      </Stack>
    </Flex>
  );
}
