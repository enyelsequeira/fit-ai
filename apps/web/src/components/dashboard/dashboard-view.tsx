import { Box, Stack } from "@mantine/core";

import { StatsOverview } from "./widgets/stats-overview/stats-overview";

import styles from "./dashboard.module.css";

export function DashboardView() {
  return (
    <Box p={{ base: "sm", md: "md" }} className={styles.dashboardContainer}>
      <Stack gap="md">
        {/* Stats Grid */}
        <Box className={styles.statsSection}>
          <StatsOverview />
        </Box>
      </Stack>
    </Box>
  );
}
