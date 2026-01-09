import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { IconBolt, IconChevronDown, IconPlayerPlay, IconStar } from "@tabler/icons-react";

import { Box, Button, Container, Group, Stack, Text, Title } from "@mantine/core";

import classes from "./Hero.module.css";

export function Hero() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box component="section" className={classes.wrapper}>
      {/* Navigation Header */}
      <Box
        component="header"
        className={`${classes.header} ${scrolled ? classes.headerScrolled : ""}`}
        role="banner"
      >
        <Container size="lg">
          <Group justify="space-between" align="center">
            <Link to="/" className={classes.logo} aria-label="FIT-AI Home">
              <Box className={classes.logoIcon}>
                <IconBolt size={22} color="white" aria-hidden="true" />
              </Box>
              <Text fw={700} fz="xl" c="white">
                FIT-AI
              </Text>
            </Link>

            <Group gap="xs" visibleFrom="sm" component="nav" aria-label="Main navigation">
              <a href="#features" className={classes.navLink}>
                Features
              </a>
              <a href="#how-it-works" className={classes.navLink}>
                How It Works
              </a>
              <a href="#pricing" className={classes.navLink}>
                Pricing
              </a>
            </Group>

            <Group gap="sm">
              <Link to={"/sign-in"}>
                <Button variant="transparent" color="gray" visibleFrom="sm">
                  Sign In
                </Button>
              </Link>
              <Link to={"/signup"}>
                <Button className={classes.primaryButton}>Get Started</Button>
              </Link>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Hero Content */}
      <Container size="lg" className={classes.heroContent}>
        <Stack align="center" gap="xl" w="100%">
          <Box className={classes.badge}>
            <Group gap={6} align="center">
              <IconBolt size={14} aria-hidden="true" />
              <span>AI-Powered Fitness Tracking</span>
            </Group>
          </Box>

          <Title
            order={1}
            ta="center"
            fz={{ base: 40, sm: 52, md: 64 }}
            fw={800}
            lh={1.1}
            c="white"
            className={classes.title}
          >
            Train Smarter.
            <br />
            <Text component="span" inherit className={classes.gradientText}>
              Achieve More.
            </Text>
          </Title>

          <Text size="xl" c="dimmed" ta="center" maw={600} lh={1.7} className={classes.subtitle}>
            Track workouts, get personalized AI recommendations, and visualize your progress. Join
            thousands of athletes transforming their fitness journey.
          </Text>

          <Group gap="md" mt="md" className={classes.buttons}>
            <Button
              component={Link}
              to="/login"
              search={{ tab: "signup" }}
              size="lg"
              className={classes.primaryButton}
              leftSection={<IconBolt size={20} aria-hidden="true" />}
            >
              Start Free Today
            </Button>
            <Button
              component="a"
              href="#how-it-works"
              size="lg"
              variant="outline"
              className={classes.secondaryButton}
              leftSection={<IconPlayerPlay size={18} aria-hidden="true" />}
            >
              See How It Works
            </Button>
          </Group>

          {/* Social Proof */}
          <Box className={classes.socialProof}>
            <Group gap="lg" align="center">
              <Box className={classes.avatarGroup} aria-label="User avatars">
                {["JD", "SM", "AK", "RP", "+5k"].map((initials, index) => (
                  <Box key={index} className={classes.avatar}>
                    {initials}
                  </Box>
                ))}
              </Box>
              <Stack gap={2}>
                <Group gap={4} className={classes.stars} aria-label="5 star rating">
                  {[...Array(5)].map((_, i) => (
                    <IconStar
                      key={i}
                      size={16}
                      fill="var(--mantine-color-yellow-5)"
                      color="var(--mantine-color-yellow-5)"
                      aria-hidden="true"
                    />
                  ))}
                </Group>
                <Text c="dimmed" fz="sm">
                  Loved by{" "}
                  <Text component="span" c="white" fw={600}>
                    50,000+
                  </Text>{" "}
                  athletes
                </Text>
              </Stack>
            </Group>
          </Box>
        </Stack>
      </Container>

      {/* Scroll Indicator */}
      <Box
        className={classes.scrollIndicator}
        component="a"
        href="#features"
        aria-label="Scroll to features"
      >
        <IconChevronDown size={28} color="var(--mantine-color-gray-5)" aria-hidden="true" />
      </Box>
    </Box>
  );
}
