import { Link } from "@tanstack/react-router";
import { IconActivity, IconBarbell, IconSparkles, IconTrendingUp } from "@tabler/icons-react";

import { Box, Container, Flex, Group, SimpleGrid, Text, Title } from "@mantine/core";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <Box
      component="section"
      pos="relative"
      style={{ overflow: "hidden" }}
      py={{ base: 80, lg: 128 }}
    >
      {/* Background gradient */}
      <Box
        pos="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        style={{
          background:
            "linear-gradient(to bottom right, rgba(147, 51, 234, 0.2), transparent, rgba(59, 130, 246, 0.2))",
        }}
      />

      {/* Animated background elements */}
      <Box pos="absolute" top={0} left={0} right={0} bottom={0} style={{ overflow: "hidden" }}>
        <Box
          pos="absolute"
          left={-16}
          top={80}
          h={288}
          w={288}
          style={{
            borderRadius: "50%",
            background: "rgba(168, 85, 247, 0.1)",
            filter: "blur(64px)",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
        <Box
          pos="absolute"
          right={-16}
          bottom={80}
          h={288}
          w={288}
          style={{
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.1)",
            filter: "blur(64px)",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            animationDelay: "0.7s",
          }}
        />
      </Box>

      <Container pos="relative" ta="center">
        {/* Floating icons */}
        <Group justify="center" gap="md" mb="xl">
          <Flex
            h={48}
            w={48}
            align="center"
            justify="center"
            style={{ borderRadius: 8, background: "rgba(168, 85, 247, 0.1)" }}
          >
            <IconBarbell size={24} style={{ color: "rgb(192, 132, 252)" }} />
          </Flex>
          <Flex
            h={56}
            w={56}
            align="center"
            justify="center"
            style={{
              borderRadius: 8,
              background:
                "linear-gradient(to bottom right, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.2))",
            }}
          >
            <IconSparkles size={28} style={{ color: "rgb(96, 165, 250)" }} />
          </Flex>
          <Flex
            h={48}
            w={48}
            align="center"
            justify="center"
            style={{ borderRadius: 8, background: "rgba(59, 130, 246, 0.1)" }}
          >
            <IconTrendingUp size={24} style={{ color: "rgb(96, 165, 250)" }} />
          </Flex>
        </Group>

        <Title order={1} fz={{ base: 36, sm: 48, lg: 60 }} fw={700} lts={-0.5}>
          Train Smarter with{" "}
          <Text
            component="span"
            inherit
            variant="gradient"
            gradient={{ from: "grape", to: "blue", deg: 90 }}
          >
            AI-Powered
          </Text>{" "}
          Fitness Tracking
        </Title>

        <Text size="lg" c="dimmed" maw={672} mx="auto" mt="xl">
          Track workouts, monitor progress, and get personalized recommendations powered by AI. Your
          intelligent fitness companion that adapts to your goals.
        </Text>

        <Flex
          direction={{ base: "column", sm: "row" }}
          align="center"
          justify="center"
          gap="md"
          mt={40}
        >
          <Link to="/login" search={{ tab: "signup" }}>
            <Button size="lg" leftSection={<IconActivity size={16} />}>
              Get Started
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </Flex>

        {/* Hero illustration placeholder */}
        <Box mt={64}>
          <Box
            mx="auto"
            maw={896}
            style={{
              overflow: "hidden",
              borderRadius: 8,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.05), transparent)",
              padding: 4,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <Box
              p="xl"
              style={{
                borderRadius: 6,
                background: "rgba(var(--mantine-color-body), 0.8)",
                backdropFilter: "blur(8px)",
              }}
            >
              <SimpleGrid cols={3} spacing="md">
                <Box
                  h={96}
                  style={{
                    borderRadius: 6,
                    background: "var(--mantine-color-default-hover)",
                    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  }}
                />
                <Box
                  h={96}
                  style={{
                    borderRadius: 6,
                    background: "var(--mantine-color-default-hover)",
                    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    animationDelay: "0.1s",
                  }}
                />
                <Box
                  h={96}
                  style={{
                    borderRadius: 6,
                    background: "var(--mantine-color-default-hover)",
                    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    animationDelay: "0.2s",
                  }}
                />
              </SimpleGrid>
              <Box
                h={128}
                mt="md"
                style={{
                  borderRadius: 6,
                  background: "var(--mantine-color-default-hover)",
                  opacity: 0.5,
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  animationDelay: "0.3s",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
