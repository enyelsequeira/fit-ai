import { IconBarbell, IconMedal, IconTarget } from "@tabler/icons-react";

import { Box, Container, Flex, SimpleGrid, Stack, Text, Title } from "@mantine/core";

interface StatProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function Stat({ icon, value, label }: StatProps) {
  return (
    <Stack align="center" gap="xs" ta="center">
      <Flex
        h={48}
        w={48}
        align="center"
        justify="center"
        style={{
          borderRadius: 8,
          background: "rgba(255, 255, 255, 0.05)",
        }}
      >
        {icon}
      </Flex>
      <Text fz={30} fw={700} lts={-0.5}>
        {value}
      </Text>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    </Stack>
  );
}

const stats: StatProps[] = [
  {
    icon: <IconBarbell size={24} style={{ color: "rgb(192, 132, 252)" }} />,
    value: "1,000+",
    label: "Workouts Logged",
  },
  {
    icon: <IconMedal size={24} style={{ color: "rgb(250, 204, 21)" }} />,
    value: "500+",
    label: "PRs Achieved",
  },
  {
    icon: <IconTarget size={24} style={{ color: "rgb(96, 165, 250)" }} />,
    value: "50+",
    label: "Exercises",
  },
];

export function Stats() {
  return (
    <Box component="section" py={{ base: 80, lg: 112 }}>
      <Container>
        <Box
          p={{ base: "xl", md: 48 }}
          style={{
            overflow: "hidden",
            borderRadius: 8,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            background:
              "linear-gradient(to bottom right, rgba(147, 51, 234, 0.1), transparent, rgba(59, 130, 246, 0.1))",
          }}
        >
          <Box mb="xl" ta="center">
            <Title order={2} fz={{ base: 24, sm: 30 }} fw={700} lts={-0.5}>
              Trusted by fitness enthusiasts
            </Title>
            <Text c="dimmed" mt="xs">
              Join the community of athletes tracking their progress
            </Text>
          </Box>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
            {stats.map((stat) => (
              <Stat key={stat.label} {...stat} />
            ))}
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
}
