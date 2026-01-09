import { IconChartBar, IconClipboardList, IconSparkles, IconTarget } from "@tabler/icons-react";

import { Box, Container, Flex, SimpleGrid, Stack, Text, Title } from "@mantine/core";

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function Step({ number, title, description, icon }: StepProps) {
  return (
    <Stack align="center" ta="center" pos="relative">
      {/* Step number badge */}
      <Box
        pos="relative"
        mb="md"
        h={64}
        w={64}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          background: "var(--mantine-color-body)",
          zIndex: 10,
          transition: "border-color 0.2s",
        }}
      >
        <Flex
          h={48}
          w={48}
          align="center"
          justify="center"
          style={{
            borderRadius: "50%",
            background:
              "linear-gradient(to bottom right, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.2))",
          }}
        >
          {icon}
        </Flex>
        <Flex
          pos="absolute"
          top={-4}
          right={-4}
          h={24}
          w={24}
          align="center"
          justify="center"
          style={{
            borderRadius: "50%",
            background: "rgb(168, 85, 247)",
            fontSize: 12,
            fontWeight: 700,
            color: "white",
          }}
        >
          {number}
        </Flex>
      </Box>

      <Title order={3} size="lg" fw={600} mb="xs">
        {title}
      </Title>
      <Text size="sm" c="dimmed">
        {description}
      </Text>
    </Stack>
  );
}

const steps: Omit<StepProps, "number">[] = [
  {
    title: "Set Your Goals",
    description: "Define your fitness objectives, preferences, and available equipment.",
    icon: <IconTarget size={24} style={{ color: "rgb(192, 132, 252)" }} />,
  },
  {
    title: "Log Workouts",
    description: "Track your exercises, sets, reps, and weights with our intuitive interface.",
    icon: <IconClipboardList size={24} style={{ color: "rgb(96, 165, 250)" }} />,
  },
  {
    title: "Track Progress",
    description: "Monitor your gains with detailed analytics and personal record tracking.",
    icon: <IconChartBar size={24} style={{ color: "rgb(74, 222, 128)" }} />,
  },
  {
    title: "Get AI Recommendations",
    description: "Receive personalized workout suggestions based on your performance.",
    icon: <IconSparkles size={24} style={{ color: "rgb(251, 146, 60)" }} />,
  },
];

export function HowItWorks() {
  return (
    <Box
      component="section"
      py={{ base: 80, lg: 112 }}
      style={{ background: "var(--mantine-color-default-hover)" }}
    >
      <Container>
        <Box mb={48} ta="center">
          <Title order={2} fz={{ base: 30, sm: 36 }} fw={700} lts={-0.5}>
            How it{" "}
            <Text
              component="span"
              inherit
              variant="gradient"
              gradient={{ from: "grape", to: "blue", deg: 90 }}
            >
              works
            </Text>
          </Title>
          <Text size="lg" c="dimmed" maw={672} mx="auto" mt="md">
            Get started in minutes and transform your fitness journey with intelligent tracking.
          </Text>
        </Box>

        <Box pos="relative">
          {/* Connecting line - visible on larger screens */}
          <Box
            pos="absolute"
            left={0}
            right={0}
            top={32}
            h={1}
            visibleFrom="lg"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)",
            }}
          />

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
            {steps.map((step, index) => (
              <Step key={step.title} number={index + 1} {...step} />
            ))}
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
}
