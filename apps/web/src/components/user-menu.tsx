import { Avatar, Group, Menu, Skeleton, Stack, Text } from "@mantine/core";
import { Link, useNavigate } from "@tanstack/react-router";
import { IconLogout, IconSettings, IconTrophy, IconUser } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton w={32} h={32} radius="xl" />;
  }

  if (!session) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Menu shadow="md" width={220} position="bottom-end">
      <Menu.Target>
        <Button variant="ghost" size="icon-sm" style={{ borderRadius: "50%", padding: 0 }}>
          <Avatar size="sm" radius="xl" src={session.user.image} alt={session.user.name}>
            {getInitials(session.user.name || session.user.email)}
          </Avatar>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Stack gap={2}>
            <Text size="sm" fw={500}>
              {session.user.name}
            </Text>
            <Text size="xs" c="dimmed">
              {session.user.email}
            </Text>
          </Stack>
        </Menu.Label>
        <Menu.Divider />
        <Menu.Item component={Link} to="/ai/preferences" leftSection={<IconUser size={14} />}>
          Profile & Settings
        </Menu.Item>
        <Menu.Item component={Link} to="/progress/records" leftSection={<IconTrophy size={14} />}>
          Personal Records
        </Menu.Item>
        <Menu.Item component={Link} to="/ai/preferences" leftSection={<IconSettings size={14} />}>
          AI Preferences
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<IconLogout size={14} />}
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  navigate({
                    to: "/",
                  });
                },
              },
            });
          }}
        >
          Sign Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
