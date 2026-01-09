import { Box, Container, SimpleGrid, Stack, Text } from "@mantine/core";

import classes from "./Stats.module.css";

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "2M+", label: "Workouts Logged" },
  { value: "800+", label: "Exercises" },
  { value: "4.9", label: "App Rating" },
];

export function Stats() {
  return (
    <Box component="section" className={classes.section} py={80} aria-label="Statistics">
      <Container size="lg" className={classes.content}>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={0}>
          {stats.map((stat) => (
            <Stack
              key={stat.label}
              gap={4}
              className={classes.statItem}
              role="figure"
              aria-label={`${stat.value} ${stat.label}`}
            >
              <Text className={classes.value}>{stat.value}</Text>
              <Text className={classes.label}>{stat.label}</Text>
            </Stack>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
