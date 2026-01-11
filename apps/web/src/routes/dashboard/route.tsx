import {
  AppShell,
  Avatar,
  Box,
  Burger,
  Divider,
  Flex,
  Group,
  Menu,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { IconHeart } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import {
  IconActivity,
  IconChartBar,
  IconChevronDown,
  IconHeartbeat,
  IconLayoutDashboard,
  IconLogout,
  IconMoon,
  IconSettings,
  IconSparkles,
  IconStretching,
  IconSun,
  IconUser,
  IconWeight,
} from "@tabler/icons-react";
import { Link, Outlet, createFileRoute, redirect, useRouter } from "@tanstack/react-router";

import { FitAiActionIcon, FitAiButton } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

import styles from "./route.module.css";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  beforeLoad: async () => {
    const sessionResult = await authClient.getSession();
    console.log("sessionResult", sessionResult);
    if (!sessionResult.data) {
      throw redirect({
        to: "/sign-in",
      });
    }
    return { session: sessionResult.data };
  },
});

interface NavLinkItem {
  label: string;
  icon: typeof IconLayoutDashboard;
  href: string;
}

const mainNavLinks: NavLinkItem[] = [
  { label: "Dashboard", icon: IconLayoutDashboard, href: "/dashboard" },
  { label: "Workouts", icon: IconWeight, href: "/workouts" },
  { label: "Exercises", icon: IconStretching, href: "/exercises" },
  { label: "Progress", icon: IconChartBar, href: "/progress" },
  { label: "Recovery", icon: IconHeartbeat, href: "/recovery" },
  { label: "AI Coach", icon: IconSparkles, href: "/ai" },
];

const bottomNavLinks: NavLinkItem[] = [
  { label: "Settings", icon: IconSettings, href: "/settings" },
];

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavLinkItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
      onClick={onClick}
    >
      <span className={styles.navLinkIcon}>
        <Icon size={20} stroke={1.5} />
      </span>
      <span>{item.label}</span>
    </Link>
  );
}

function ButtonShowcase() {
  const variants = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const;
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
  const actionIconVariants = ["default", "outline", "secondary", "ghost", "destructive"] as const;
  const actionIconSizes = ["xs", "sm", "md", "lg", "xl"] as const;

  return (
    <Paper p="md" mt="xl" withBorder>
      <Title order={4} mb="md">
        FitAiButton Variants
      </Title>

      {/* Text Buttons by Variant */}
      <Stack gap="lg">
        {variants.map((variant) => (
          <Box key={variant}>
            <Text size="sm" fw={500} mb="xs" tt="capitalize">
              {variant}
            </Text>
            <Group gap="sm">
              {sizes.map((size) => (
                <FitAiButton key={size} variant={variant} size={size}>
                  {size}
                </FitAiButton>
              ))}
            </Group>
          </Box>
        ))}
      </Stack>

      <Divider my="lg" label="FitAiButton with Icons" labelPosition="center" />

      {/* Buttons with left/right sections */}
      <Group gap="sm">
        <FitAiButton leftSection={<IconHeart size={16} />}>Left Icon</FitAiButton>
        <FitAiButton rightSection={<IconHeart size={16} />}>Right Icon</FitAiButton>
        <FitAiButton variant="outline" leftSection={<IconHeart size={16} />}>
          Outline
        </FitAiButton>
        <FitAiButton variant="ghost" leftSection={<IconHeart size={16} />}>
          Ghost
        </FitAiButton>
      </Group>

      <Divider my="lg" label="FitAiButton States" labelPosition="center" />

      {/* States */}
      <Group gap="sm">
        <FitAiButton>Normal</FitAiButton>
        <FitAiButton disabled>Disabled</FitAiButton>
        <FitAiButton loading>Loading</FitAiButton>
        <FitAiButton fullWidth>Full Width</FitAiButton>
      </Group>

      <Divider my="lg" label="FitAiActionIcon Variants" labelPosition="center" />

      {/* Action Icon Buttons */}
      <Stack gap="lg">
        {actionIconVariants.map((variant) => (
          <Box key={variant}>
            <Text size="sm" fw={500} mb="xs" tt="capitalize">
              {variant}
            </Text>
            <Group gap="sm">
              {actionIconSizes.map((size) => (
                <FitAiActionIcon
                  key={size}
                  variant={variant}
                  size={size}
                  aria-label={`${variant} ${size}`}
                >
                  <IconHeart size={size === "xs" ? 14 : size === "sm" ? 16 : 18} />
                </FitAiActionIcon>
              ))}
            </Group>
          </Box>
        ))}
      </Stack>

      <Divider my="lg" label="FitAiActionIcon States" labelPosition="center" />

      {/* Action Icon States */}
      <Group gap="sm">
        <FitAiActionIcon aria-label="Normal">
          <IconHeart size={18} />
        </FitAiActionIcon>
        <FitAiActionIcon disabled aria-label="Disabled">
          <IconHeart size={18} />
        </FitAiActionIcon>
        <FitAiActionIcon loading aria-label="Loading">
          <IconHeart size={18} />
        </FitAiActionIcon>
        <FitAiActionIcon variant="destructive" aria-label="Destructive Outline">
          <IconHeart size={18} />
        </FitAiActionIcon>
      </Group>
    </Paper>
  );
}

function DashboardLayout() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { session } = Route.useRouteContext();
  const router = useRouter();
  console.log({ session });
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
    }
    return location.pathname.startsWith(href);
  };

  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <AppShell
      header={{ height: { base: 60, md: 70 } }}
      styles={{
        header: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingInline: "var(--mantine-spacing-sm)",
        },
      }}
      navbar={{
        width: { base: 250, md: 250, lg: 280 },
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      {/* Header */}
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
          <Tooltip label={colorScheme === "dark" ? "Light mode" : "Dark mode"} position="bottom">
            <FitAiActionIcon variant={"ghost"} size={"sm"} c={"blue"} onClick={toggleColorScheme}>
              {colorScheme === "dark" ? (
                <IconSun size={20} stroke={1.5} />
              ) : (
                <IconMoon size={20} stroke={1.5} />
              )}
            </FitAiActionIcon>
          </Tooltip>
          <Menu shadow="md" width={220} position="bottom-end" withArrow arrowPosition="center">
            <Menu.Target>
              <UnstyledButton className={styles.userMenuButton}>
                <Avatar size="sm" radius="xl" color="blue" alt={userName}>
                  {userInitials}
                </Avatar>
                <Text fw={500} fz={"sm"} className={"mantine-visible-from-md"}>
                  {userName}
                </Text>
                <IconChevronDown size={14} stroke={1.5} />
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown px={"xs"}>
              <Box py={"xs"} px={"sm"}>
                <Text fz={"sm"} fw={600}>
                  {userName}
                </Text>
                <Text fz={"sm"} c={"dimmed"}>
                  {userEmail}
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

      {/* Navbar */}
      <AppShell.Navbar>
        {/* Main navigation links */}
        <Flex flex={1} direction={"column"} gap={"xs"}>
          <Text fz={"sm"} tt={"uppercase"} fw={"bold"} c={"dimmed"} px={"sm"} py={"md"}>
            Menu
          </Text>
          {mainNavLinks.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActiveRoute(item.href)}
              onClick={closeMobile}
            />
          ))}
        </Flex>

        <Divider my={"xs"} />
        {/* Bottom navigation links */}
        <Flex mt={"auto"} pt={"md"}>
          {bottomNavLinks.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActiveRoute(item.href)}
              onClick={closeMobile}
            />
          ))}
        </Flex>
      </AppShell.Navbar>
      {/* Main content */}
      <AppShell.Main>
        <Outlet />
        <ButtonShowcase />
      </AppShell.Main>
    </AppShell>
  );
}
