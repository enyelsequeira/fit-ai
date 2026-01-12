import {
  AppShell,
  Avatar,
  Box,
  Burger,
  Flex,
  Menu,
  Text,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { Link, useRouter } from "@tanstack/react-router";
import styles from "@/components/dashboard/layout/layout.module.css";
import {
  IconActivity,
  IconChevronDown,
  IconLogout,
  IconMoon,
  IconSettings,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import { FitAiActionIcon } from "@/components/ui/fit-ai-button/fit-ai-action-icon.tsx";
import { authClient } from "@/lib/auth-client.ts";

type Props = {
  mobileOpened: boolean;
  toggleMobile: () => void;
  desktopOpened: boolean;
  toggleDesktop: () => void;
  session: {
    userName?: string;
    userEmail?: string;
    userInitials?: string;
  };
};

const DashboardHeader = ({
  toggleDesktop,
  toggleMobile,
  session,
  mobileOpened,
  desktopOpened,
}: Props) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const router = useRouter();

  return (
    <AppShell.Header>
      <Flex align={"center"} gap={"xs"}>
        {/* Mobile burger */}
        <Burger
          opened={mobileOpened}
          onClick={toggleMobile}
          hiddenFrom="sm"
          size="sm"
          aria-label="Toggle navigation"
        />
        {/* Desktop burger (for collapsing) */}
        <Burger
          opened={desktopOpened}
          onClick={toggleDesktop}
          visibleFrom="sm"
          size="sm"
          aria-label="Toggle navigation"
        />

        {/* Brand/Logo */}
        <Link to="/dashboard" className={styles.brand}>
          <Flex
            justify={"center"}
            align={"center"}
            h={36}
            w={36}
            bdrs={"md"}
            c={"white"}
            style={{
              flexShrink: 0,
              background:
                " linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-cyan-5))",
            }}
          >
            <IconActivity size={22} stroke={2} />
          </Flex>
          <Text
            fz={"lg"}
            fw={700}
            component={"span"}
            variant={"gradient"}
            gradient={{ from: "blue.5", to: "cyan.4", deg: 90 }}
          >
            FitAI
          </Text>
        </Link>
      </Flex>

      <Flex align={"center"} gap={"xs"}>
        <Tooltip
          label={colorScheme === "dark" ? "Light mode" : "Dark mode"}
          position="bottom"
        >
          <FitAiActionIcon
            variant={"ghost"}
            size={"sm"}
            c={"blue"}
            onClick={toggleColorScheme}
          >
            {colorScheme === "dark" ? (
              <IconSun size={20} stroke={1.5} />
            ) : (
              <IconMoon size={20} stroke={1.5} />
            )}
          </FitAiActionIcon>
        </Tooltip>
        <Menu
          shadow="md"
          width={220}
          position="bottom-end"
          withArrow
          arrowPosition="center"
        >
          <Menu.Target>
            <UnstyledButton className={styles.userMenuButton}>
              <Avatar
                size="sm"
                radius="xl"
                color="blue"
                alt={session?.userName}
              >
                {session?.userInitials || ""}
              </Avatar>
              <Text fw={500} fz={"sm"} className={"mantine-visible-from-md"}>
                {session?.userName || ""}
              </Text>
              <IconChevronDown size={14} stroke={1.5} />
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown px={"xs"}>
            <Box py={"xs"} px={"sm"}>
              <Text fz={"sm"} fw={600}>
                {session?.userName || ""}
              </Text>
              <Text fz={"sm"} c={"dimmed"}>
                {session?.userEmail || ""}
              </Text>
            </Box>

            <Menu.Divider />

            <Menu.Item
              component={Link}
              to="/settings"
              leftSection={<IconUser size={16} stroke={1.5} />}
              fz={"sm"}
            >
              Profile
            </Menu.Item>

            <Menu.Item
              component={Link}
              to="/settings"
              leftSection={<IconSettings size={16} stroke={1.5} />}
              fz={"sm"}
            >
              Settings
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              fz={"sm"}
              leftSection={<IconLogout size={16} stroke={1.5} />}
              c={"red.6"}
              onClick={async () => {
                await authClient.signOut();
                router.invalidate();
              }}
            >
              Sign out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Flex>
    </AppShell.Header>
  );
};

export default DashboardHeader;
