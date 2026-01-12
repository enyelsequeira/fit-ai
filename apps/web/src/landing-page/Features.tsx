import {
  IconBarbell,
  IconBrain,
  IconChartLine,
  IconHeartbeat,
  IconSparkles,
  IconTrophy,
} from "@tabler/icons-react";

import { Badge, Box, Container, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";

import classes from "./Features.module.css";

const features = [
  {
    icon: IconBrain,
    title: "AI-Powered Recommendations",
    description:
      "Get personalized workout suggestions based on your goals, history, and recovery status. Our AI learns from your progress to optimize every session.",
    featured: true,
  },
  {
    icon: IconChartLine,
    title: "Progress Analytics",
    description:
      "Track your gains with beautiful charts and detailed performance metrics over time.",
  },
  {
    icon: IconBarbell,
    title: "800+ Exercises",
    description:
      "Access a comprehensive library with detailed instructions and muscle targeting info.",
  },
  {
    icon: IconHeartbeat,
    title: "Recovery Tracking",
    description:
      "Monitor sleep, energy, and soreness to optimize training and prevent overtraining.",
  },
  {
    icon: IconTrophy,
    title: "Personal Records",
    description: "Celebrate every PR with automatic tracking and historical comparisons.",
  },
  {
    icon: IconSparkles,
    title: "Smart Insights",
    description: "Receive actionable tips to break through plateaus and keep improving.",
  },
];

export function Features() {
  return (
    <Box component="section" id="features" className={classes.section} py={100}>
      <Container size="lg">
        <Stack align="center" gap="lg" mb={60} className={classes.sectionHeader}>
          <Badge size="lg" radius="sm" className={classes.sectionBadge} tt="uppercase">
            Features
          </Badge>
          <Title order={2} ta="center" fz={{ base: 32, sm: 40 }} fw={700} c="white">
            Everything you need to{" "}
            <Text component="span" inherit c="blue.4">
              reach your goals
            </Text>
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={540} lh={1.7}>
            Powerful tools designed by fitness enthusiasts, backed by intelligent AI that adapts to
            your unique journey.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" className={classes.grid}>
          {features.map((feature) => (
            <Paper
              key={feature.title}
              radius="md"
              className={`${classes.card} ${feature.featured ? classes.cardFeatured : ""}`}
              role="article"
              aria-label={feature.title}
            >
              <Box className={classes.cardInner}>
                <Box className={classes.iconWrapper} aria-hidden="true">
                  <feature.icon size={26} stroke={1.5} color="var(--mantine-color-blue-4)" />
                </Box>
                <Box className={classes.cardContent}>
                  <Text className={classes.cardTitle}>{feature.title}</Text>
                  <Text className={classes.cardDescription}>{feature.description}</Text>
                </Box>
              </Box>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
