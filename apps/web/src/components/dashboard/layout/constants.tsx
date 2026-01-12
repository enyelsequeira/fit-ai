import {
  IconChartBar,
  IconHeartbeat,
  IconLayoutDashboard,
  IconSparkles,
  IconStretching,
  IconWeight,
} from "@tabler/icons-react";

export type NavLinkItem = {
  label: string;
  icon: typeof IconLayoutDashboard;
  href: string;
};

export const mainNavLinks: NavLinkItem[] = [
  { label: "Dashboard", icon: IconLayoutDashboard, href: "/dashboard" },
  { label: "Workouts", icon: IconWeight, href: "/dashboard/workouts" },
  { label: "Exercises", icon: IconStretching, href: "/exercises" },
  { label: "Progress", icon: IconChartBar, href: "/progress" },
  { label: "Recovery", icon: IconHeartbeat, href: "/recovery" },
  { label: "AI Coach", icon: IconSparkles, href: "/ai" },
];
