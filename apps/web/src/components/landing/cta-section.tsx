import { Link } from "@tanstack/react-router";
import { IconArrowRight } from "@tabler/icons-react";

import { Box, Container, Flex, Text, Title } from "@mantine/core";

import { FitAiButton } from "@/components/ui/button";

export function CTASection() {
  return (
    <Box component="section" py={{ base: 80, lg: 112 }}>
      <Container>
        <Box
          pos="relative"
          p={{ base: "xl", md: 64 }}
          ta="center"
          style={{
            overflow: "hidden",
            borderRadius: 8,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            background:
              "linear-gradient(to bottom right, rgba(147, 51, 234, 0.2), transparent, rgba(59, 130, 246, 0.2))",
          }}
        >
          {/* Background decorations */}
          <Box
            pos="absolute"
            left={-80}
            top={-80}
            h={160}
            w={160}
            style={{
              borderRadius: "50%",
              background: "rgba(168, 85, 247, 0.1)",
              filter: "blur(64px)",
            }}
          />
          <Box
            pos="absolute"
            right={-80}
            bottom={-80}
            h={160}
            w={160}
            style={{
              borderRadius: "50%",
              background: "rgba(59, 130, 246, 0.1)",
              filter: "blur(64px)",
            }}
          />

          <Box pos="relative">
            <Title order={2} fz={{ base: 30, sm: 36, lg: 48 }} fw={700} lts={-0.5}>
              Ready to transform your{" "}
              <Text
                component="span"
                inherit
                variant="gradient"
                gradient={{ from: "grape", to: "blue", deg: 90 }}
              >
                fitness journey
              </Text>
              ?
            </Title>

            <Text size="lg" c="dimmed" maw={672} mx="auto" mt="md">
              Start tracking your workouts, monitor your progress, and let AI help you reach your
              goals faster than ever.
            </Text>

            <Flex
              direction={{ base: "column", sm: "row" }}
              align="center"
              justify="center"
              gap="md"
              mt="xl"
            >
              <Link to="/login" search={{ tab: "signup" }}>
                <FitAiButton size="lg" rightSection={<IconArrowRight size={16} />}>
                  Start Free
                </FitAiButton>
              </Link>
              <Text size="sm" c="dimmed">
                No credit card required
              </Text>
            </Flex>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
