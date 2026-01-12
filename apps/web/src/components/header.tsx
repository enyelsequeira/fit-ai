import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  Skeleton,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  IconBarbell,
  IconHeart,
  IconLayoutDashboard,
  IconLibrary,
  IconPlus,
  IconSparkles,
  IconTrendingUp,
} from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";

import MobileNav from "./mobile-nav";
import UserMenu from "./user-menu";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { to: "/workouts", label: "Workouts", icon: IconBarbell },
  { to: "/exercises", label: "Exercises", icon: IconLibrary },
  { to: "/progress", label: "Progress", icon: IconTrendingUp },
  { to: "/ai", label: "AI", icon: IconSparkles },
  { to: "/recovery", label: "Recovery", icon: IconHeart },
] as const;

function HeaderSkeleton() {
  return (
    <Box
      component="header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        borderBottom: "1px solid var(--mantine-color-dark-4)",
        backgroundColor: "var(--mantine-color-dark-7)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Container size="xl">
        <Group h={56} justify="space-between">
          <Group gap="xs">
            <Skeleton w={24} h={24} />
            <Skeleton w={64} h={20} />
          </Group>
          <Group gap="md" visibleFrom="md">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} w={80} h={16} />
            ))}
          </Group>
          <Skeleton w={32} h={32} radius="xl" />
        </Group>
      </Container>
    </Box>
  );
}

interface NavLinkProps {
  to: string;
  label: string;
  icon: typeof IconLayoutDashboard;
  currentPath: string;
}

function NavLink({ to, label, icon: Icon, currentPath }: NavLinkProps) {
  const isActive = currentPath === to || currentPath.startsWith(`${to}/`);

  return (
    <UnstyledButton
      component={Link}
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 4,
        color: isActive ? "var(--mantine-color-white)" : "var(--mantine-color-dimmed)",
        fontWeight: 500,
        fontSize: 14,
        transition: "color 150ms",
      }}
      styles={{
        root: {
          "&:hover": {
            color: "var(--mantine-color-white)",
          },
        },
      }}
    >
      <Icon size={16} />
      <Text size="sm" visibleFrom="lg">
        {label}
      </Text>
    </UnstyledButton>
  );
}

export default function Header() {
  const { data: session, isPending } = authClient.useSession();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  if (isPending) {
    return <HeaderSkeleton />;
  }

  return (
    <Box
      component="header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        borderBottom: "1px solid var(--mantine-color-dark-4)",
        backgroundColor: "var(--mantine-color-dark-7)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Container size="xl" px="md">
        <Group h={56} justify="space-between">
          {/* Logo */}
          <UnstyledButton component={Link} to="/">
            <Group gap="xs">
              <IconBarbell size={24} />
              <Title order={4} fw={700}>
                Fit AI
              </Title>
            </Group>
          </UnstyledButton>

          {session ? (
            <>
              {/* Desktop Navigation */}
              <Group gap={4} visibleFrom="md" style={{ flex: 1, justifyContent: "center" }}>
                {navLinks.map((link) => (
                  <NavLink key={link.to} {...link} currentPath={currentPath} />
                ))}
              </Group>

              {/* Quick Actions & User Menu */}
              <Group gap="sm">
                {/* Quick Add Workout Button */}
                <ActionIcon
                  component={Link}
                  to="/workouts/new"
                  variant="subtle"
                  size="md"
                  title="Start new workout"
                  visibleFrom="sm"
                >
                  <IconPlus size={16} />
                </ActionIcon>

                {/* User Menu */}
                <UserMenu />

                {/* Mobile Navigation */}
                <MobileNav />
              </Group>
            </>
          ) : (
            /* Unauthenticated State */
            <Group gap="sm">
              <Button component={Link} to="/sign-in" variant="ghost" size="sm">
                Sign In
              </Button>
              <Button component={Link} to="/signup" size="sm">
                Get Started
              </Button>
            </Group>
          )}
        </Group>
      </Container>
    </Box>
  );
}
