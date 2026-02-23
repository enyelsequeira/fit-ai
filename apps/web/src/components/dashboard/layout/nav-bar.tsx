import { AppShell, Flex, Text } from "@mantine/core";
import { mainNavLinks } from "@/components/dashboard/layout/constants.tsx";
import DashboardNavLink from "@/components/dashboard/layout/nav-link.tsx";
import { useLocation } from "@tanstack/react-router";

type Props = {
  closeMobile: () => void;
};

const DashboardNavBar = ({ closeMobile }: Props) => {
  const location = useLocation();

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
    }
    return location.pathname.startsWith(href);
  };
  return (
    <AppShell.Navbar>
      {/* Main navigation links */}
      <Flex flex={1} direction={"column"} gap={"xs"}>
        <Text fz={"sm"} tt={"uppercase"} fw={"bold"} c={"dimmed"} px={"sm"} py={"md"}>
          Menu
        </Text>
        {mainNavLinks.map((item) => (
          <DashboardNavLink
            key={item.href}
            item={item}
            isActive={isActiveRoute(item.href)}
            onClick={closeMobile}
          />
        ))}
      </Flex>
    </AppShell.Navbar>
  );
};

export default DashboardNavBar;
