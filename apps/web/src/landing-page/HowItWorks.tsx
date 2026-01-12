import { IconCheck, IconRocket, IconTargetArrow, IconUserPlus } from "@tabler/icons-react";

import { Badge, Box, Container, SimpleGrid, Stack, Text, Title } from "@mantine/core";

import classes from "./HowItWorks.module.css";

const steps = [
  {
    number: 1,
    title: "Create Your Profile",
    description:
      "Sign up and tell us about your fitness goals, experience level, and available equipment.",
    icon: IconUserPlus,
  },
  {
    number: 2,
    title: "Get AI Recommendations",
    description:
      "Our AI generates personalized workout plans tailored specifically to your needs and schedule.",
    icon: IconTargetArrow,
  },
  {
    number: 3,
    title: "Track Your Workouts",
    description:
      "Log every set and rep with our intuitive interface. Rest timers and quick actions included.",
    icon: IconCheck,
  },
  {
    number: 4,
    title: "Achieve Your Goals",
    description:
      "Watch your progress with detailed analytics, celebrate PRs, and crush your fitness goals.",
    icon: IconRocket,
  },
];

export function HowItWorks() {
  return (
    <Box component="section" id="how-it-works" className={classes.section} py={100}>
      <Container size="lg">
        <Stack align="center" gap="lg" mb={70}>
          <Badge size="lg" radius="sm" className={classes.sectionBadge} tt="uppercase">
            How It Works
          </Badge>
          <Title order={2} ta="center" fz={{ base: 32, sm: 40 }} fw={700} c="white">
            Get started in{" "}
            <Text component="span" inherit c="blue.4">
              four simple steps
            </Text>
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={480} lh={1.7}>
            From signup to seeing results, we make the journey simple and motivating.
          </Text>
        </Stack>

        <Box className={classes.timeline}>
          <Box className={classes.timelineConnector} aria-hidden="true" />

          <SimpleGrid cols={{ base: 1, lg: 4 }} spacing={{ base: 0, lg: "xl" }}>
            {steps.map((step) => (
              <Stack
                key={step.number}
                gap="lg"
                align={{ base: "flex-start", lg: "center" }}
                className={classes.step}
                role="listitem"
              >
                <Box className={classes.stepNumber} aria-hidden="true">
                  {step.number}
                  <Box className={classes.stepIcon}>
                    <step.icon size={14} color="var(--mantine-color-blue-4)" />
                  </Box>
                </Box>
                <Box className={classes.stepContent}>
                  <Text className={classes.stepTitle}>{step.title}</Text>
                  <Text className={classes.stepDescription}>{step.description}</Text>
                </Box>
              </Stack>
            ))}
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
}
