import {
  ActionIcon,
  Avatar,
  Box,
  Divider,
  Drawer,
  Group,
  NavLink,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  IconBarbell,
  IconHeart,
  IconLayoutDashboard,
  IconLibrary,
  IconLogout,
  IconMenu2,
  IconSparkles,
  IconTrendingUp,
} from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { to: "/dashboard/workouts", label: "Workouts", icon: IconBarbell },
  { to: "/exercises", label: "Exercises", icon: IconLibrary },
  { to: "/progress", label: "Progress", icon: IconTrendingUp },
  { to: "/ai", label: "AI", icon: IconSparkles },
  { to: "/recovery", label: "Recovery", icon: IconHeart },
] as const;

export default function MobileNav() {
  const [opened, { open, close }] = useDisclosure(false);
  const { data: session } = authClient.useSession();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    close();
    authClient.signOut();
  };

  return (
    <>
      <ActionIcon
        variant="subtle"
        size="md"
        onClick={open}
        hiddenFrom="md"
        aria-label="Toggle navigation menu"
      >
        <IconMenu2 size={20} />
      </ActionIcon>

      <Drawer
        opened={opened}
        onClose={close}
        position="left"
        size="xs"
        title={
          <Group gap="xs">
            <IconBarbell size={20} />
            <Title order={4}>Fit AI</Title>
          </Group>
        }
      >
        <Stack h="100%" justify="space-between">
          <Stack gap="xs" py="md">
            {navLinks.map((link) => {
              const isActive = currentPath === link.to || currentPath.startsWith(`${link.to}/`);
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.to}
                  component={Link}
                  to={link.to}
                  label={link.label}
                  leftSection={<Icon size={16} />}
                  active={isActive}
                  onClick={close}
                  styles={{
                    root: {
                      borderRadius: 4,
                    },
                  }}
                />
              );
            })}
          </Stack>

          {session && (
            <Box>
              <Divider mb="md" />
              <Group gap="sm" mb="sm">
                <Avatar size="sm" radius="xl" src={session.user.image}>
                  {getInitials(session.user.name || session.user.email)}
                </Avatar>
                <Stack gap={0} style={{ flex: 1, overflow: "hidden" }}>
                  <Text size="sm" fw={500} truncate>
                    {session.user.name}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {session.user.email}
                  </Text>
                </Stack>
              </Group>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                leftSection={<IconLogout size={16} />}
                onClick={handleSignOut}
                style={{ justifyContent: "flex-start" }}
              >
                Sign out
              </Button>
            </Box>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
