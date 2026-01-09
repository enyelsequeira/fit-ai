import type { Session } from "better-auth/types";

import {
  AppShell,
  Avatar,
  Box,
  Burger,
  Group,
  Menu,
  Text,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
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
import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

import styles from "./route.module.css";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  beforeLoad: async () => {
    const sessionResult = await authClient.getSession();
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

function ColorSchemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Tooltip label={colorScheme === "dark" ? "Light mode" : "Dark mode"} position="bottom">
      <UnstyledButton className={styles.colorSchemeToggle} onClick={toggleColorScheme}>
        {colorScheme === "dark" ? <IconSun size={20} stroke={1.5} /> : <IconMoon size={20} stroke={1.5} />}
      </UnstyledButton>
    </Tooltip>
  );
}

function UserMenu({ session }: { session: Session | null }) {
  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/sign-in";
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
    <Menu shadow="md" width={220} position="bottom-end" withArrow arrowPosition="center">
      <Menu.Target>
        <UnstyledButton className={styles.userMenuButton}>
          <Avatar size="sm" radius="xl" color="blue" alt={userName}>
            {userInitials}
          </Avatar>
          <Text className={styles.userName}>{userName}</Text>
          <IconChevronDown size={14} stroke={1.5} />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown className={styles.dropdown}>
        <Box className={styles.userInfo}>
          <Text className={styles.userInfoName}>{userName}</Text>
          <Text className={styles.userInfoEmail}>{userEmail}</Text>
        </Box>

        <Menu.Divider />

        <Menu.Item
          component={Link}
          to="/settings"
          leftSection={<IconUser size={16} stroke={1.5} />}
          className={styles.menuItem}
        >
          Profile
        </Menu.Item>

        <Menu.Item
          component={Link}
          to="/settings"
          leftSection={<IconSettings size={16} stroke={1.5} />}
          className={styles.menuItem}
        >
          Settings
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconLogout size={16} stroke={1.5} />}
          className={`${styles.menuItem} ${styles.menuItemDanger}`}
          onClick={handleLogout}
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

function DashboardLayout() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const location = useLocation();
  const { session } = Route.useRouteContext();

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <AppShell
      className={styles.appShell}
      header={{ height: { base: 60, md: 70 } }}
      navbar={{
        width: { base: 250, md: 250, lg: 280 },
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header>
        <header className={styles.header}>
          <Group gap="sm">
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
              <div className={styles.logoIcon}>
                <IconActivity size={22} stroke={2} />
              </div>
              <span className={styles.logoText}>FitAI</span>
            </Link>
          </Group>

          <div className={styles.headerRight}>
            <ColorSchemeToggle />
            <UserMenu session={session} />
          </div>
        </header>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar className={styles.navbarTransition}>
        <nav className={styles.navbar}>
          {/* Main navigation links */}
          <div className={styles.navLinks}>
            <Text className={styles.navSectionLabel}>Menu</Text>
            {mainNavLinks.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={isActiveRoute(item.href)}
                onClick={closeMobile}
              />
            ))}
          </div>

          {/* Divider */}
          <div className={styles.navDivider} />

          {/* Bottom navigation links */}
          <div className={styles.navBottom}>
            {bottomNavLinks.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={isActiveRoute(item.href)}
                onClick={closeMobile}
              />
            ))}
          </div>
        </nav>
      </AppShell.Navbar>

      {/* Main content */}
      <AppShell.Main className={styles.main}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
