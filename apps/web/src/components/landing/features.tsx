import type { Icon } from "@tabler/icons-react";

import { IconBarbell, IconBattery, IconSparkles, IconTrendingUp } from "@tabler/icons-react";

import { Box, Container, Flex, SimpleGrid, Text, Title } from "@mantine/core";

import { Card } from "@/components/ui/card";

interface FeatureCardProps {
  icon: Icon;
  title: string;
  description: string;
  gradientFrom: string;
  iconColor: string;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  gradientFrom,
  iconColor,
}: FeatureCardProps) {
  return (
    <Card
      p="lg"
      style={{
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      {/* Hover gradient effect */}
      <Box
        pos="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        style={{
          background: `linear-gradient(to bottom right, ${gradientFrom}, transparent)`,
          opacity: 0,
          transition: "opacity 0.2s",
        }}
      />

      <Box pos="relative">
        <Flex
          h={48}
          w={48}
          mb="md"
          align="center"
          justify="center"
          style={{
            borderRadius: 8,
            background: "rgba(255, 255, 255, 0.05)",
            transition: "background 0.2s",
          }}
        >
          <Icon size={24} style={{ color: iconColor }} />
        </Flex>
        <Title order={3} size="lg" fw={600} mb="xs">
          {title}
        </Title>
        <Text size="sm" c="dimmed" lh={1.6}>
          {description}
        </Text>
      </Box>
    </Card>
  );
}

const features: FeatureCardProps[] = [
  {
    icon: IconBarbell,
    title: "Smart Workout Tracking",
    description:
      "Log exercises, sets, and reps with ease. See your previous performance to beat your records and stay motivated.",
    gradientFrom: "rgba(249, 115, 22, 0.05)",
    iconColor: "rgb(251, 146, 60)",
  },
  {
    icon: IconSparkles,
    title: "AI-Generated Workouts",
    description:
      "Get personalized workout recommendations based on your goals, available equipment, and recovery status.",
    gradientFrom: "rgba(168, 85, 247, 0.05)",
    iconColor: "rgb(192, 132, 252)",
  },
  {
    icon: IconTrendingUp,
    title: "Progress Analytics",
    description:
      "Track your strength gains, body measurements, and PRs with beautiful charts and actionable insights.",
    gradientFrom: "rgba(59, 130, 246, 0.05)",
    iconColor: "rgb(96, 165, 250)",
  },
  {
    icon: IconBattery,
    title: "Recovery Tracking",
    description:
      "Daily check-ins help optimize your training by tracking sleep, energy levels, and muscle recovery.",
    gradientFrom: "rgba(34, 197, 94, 0.05)",
    iconColor: "rgb(74, 222, 128)",
  },
];

export function Features() {
  return (
    <Box component="section" py={{ base: 80, lg: 112 }}>
      <Container>
        <Box mb={48} ta="center">
          <Title order={2} fz={{ base: 30, sm: 36 }} fw={700} lts={-0.5}>
            Everything you need to{" "}
            <Text
              component="span"
              inherit
              variant="gradient"
              gradient={{ from: "grape", to: "blue", deg: 90 }}
            >
              level up
            </Text>
          </Title>
          <Text size="lg" c="dimmed" maw={672} mx="auto" mt="md">
            Powerful features designed to help you train smarter, recover faster, and achieve your
            fitness goals.
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
