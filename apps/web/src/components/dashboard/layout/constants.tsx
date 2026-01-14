import {
  IconChartLine,
  IconHeartbeat,
  IconLayoutDashboard,
  IconRuler,
  IconSparkles,
  IconStretching,
  IconTarget,
  IconTemplate,
  IconTrophy,
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
  { label: "Templates", icon: IconTemplate, href: "/dashboard/templates" },
  { label: "Exercises", icon: IconStretching, href: "/dashboard/exercises" },
  { label: "Goals", icon: IconTarget, href: "/dashboard/goals" },
  { label: "Records", icon: IconTrophy, href: "/dashboard/records" },
  { label: "Measurements", icon: IconRuler, href: "/dashboard/measurements" },
  { label: "Analytics", icon: IconChartLine, href: "/dashboard/analytics" },
  { label: "Recovery", icon: IconHeartbeat, href: "/dashboard/recovery" },
  { label: "AI Coach", icon: IconSparkles, href: "/ai" },
];
