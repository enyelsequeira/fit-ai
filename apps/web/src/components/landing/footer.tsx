import { IconBarbell } from "@tabler/icons-react";

import { Anchor, Box, Container, Flex, Group, Text } from "@mantine/core";

const footerLinks = [
  { label: "About", href: "#" },
  { label: "Features", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

export function Footer() {
  return (
    <Box
      component="footer"
      py="xl"
      style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Container>
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify={{ md: "space-between" }}
          gap="lg"
        >
          {/* Logo and brand */}
          <Group gap="xs">
            <Flex
              h={32}
              w={32}
              align="center"
              justify="center"
              style={{
                borderRadius: 8,
                background:
                  "linear-gradient(to bottom right, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.2))",
              }}
            >
              <IconBarbell size={16} style={{ color: "rgb(192, 132, 252)" }} />
            </Flex>
            <Text fw={600}>Fit AI</Text>
          </Group>

          {/* Links */}
          <Group component="nav" gap="lg" wrap="wrap" justify="center">
            {footerLinks.map((link) => (
              <Anchor
                key={link.label}
                href={link.href}
                size="sm"
                c="dimmed"
                underline="never"
                style={{ transition: "color 0.2s" }}
              >
                {link.label}
              </Anchor>
            ))}
          </Group>

          {/* Tech stack */}
          <Text size="xs" c="dimmed">
            Built with TanStack + oRPC + AI
          </Text>
        </Flex>

        {/* Copyright */}
        <Box
          mt="lg"
          pt="lg"
          ta="center"
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <Text size="xs" c="dimmed">
            &copy; {new Date().getFullYear()} Fit AI. All rights reserved.
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
