import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { getUser } from "@/lib/get-user.ts";
import DashboardHeader from "@/components/dashboard/layout/header.tsx";
import DashboardNavBar from "@/components/dashboard/layout/nav-bar.tsx";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    console.log(context);
    if (!context.session) {
      throw redirect({
        to: "/sign-in",
      });
    }
  },
});

function DashboardLayout() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { session } = Route.useRouteContext();

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
      <DashboardHeader
        mobileOpened={mobileOpened}
        toggleMobile={toggleMobile}
        desktopOpened={desktopOpened}
        toggleDesktop={toggleDesktop}
        session={{
          userEmail,
          userInitials,
          userName,
        }}
      />

      {/* Navbar */}
      <DashboardNavBar closeMobile={closeMobile} />
      {/* Main content */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
