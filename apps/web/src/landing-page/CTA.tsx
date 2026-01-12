import { Link } from "@tanstack/react-router";
import { IconBolt, IconCheck, IconCreditCardOff, IconLock } from "@tabler/icons-react";

import { Badge, Box, Button, Container, Stack, Text, Title } from "@mantine/core";

import classes from "./CTA.module.css";

const features = [
  { icon: IconCreditCardOff, text: "No credit card required" },
  { icon: IconLock, text: "Cancel anytime" },
  { icon: IconCheck, text: "Full access to all features" },
];

export function CTA() {
  return (
    <Box component="section" id="pricing" className={classes.section} py={100}>
      <Container size="md">
        <Box className={classes.wrapper}>
          <Stack align="center" gap="lg" className={classes.content}>
            <Badge size="lg" radius="sm" className={classes.badge} tt="uppercase">
              Start Today
            </Badge>

            <Title order={2} ta="center" className={classes.title}>
              Ready to transform your{" "}
              <Text component="span" inherit className={classes.highlight}>
                fitness journey?
              </Text>
            </Title>

            <Text ta="center" className={classes.description}>
              Join thousands of athletes who have already leveled up their training with AI-powered
              insights and personalized recommendations.
            </Text>

            <Button
              component={Link}
              to="/signup"
              size="xl"
              className={classes.primaryButton}
              leftSection={<IconBolt size={20} aria-hidden="true" />}
            >
              Get Started Free
            </Button>

            <Box className={classes.features}>
              {features.map((feature) => (
                <Box key={feature.text} className={classes.feature}>
                  <Box className={classes.featureIcon} aria-hidden="true">
                    <feature.icon size={12} color="var(--mantine-color-blue-4)" />
                  </Box>
                  <Text component="span">{feature.text}</Text>
                </Box>
              ))}
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
