import type { Icon } from "@tabler/icons-react";

import { Badge, Group } from "@mantine/core";
import {
  IconBarbell,
  IconBolt,
  IconDots,
  IconFlame,
  IconHeart,
  IconShield,
  IconStack2,
  IconStretching,
  IconTarget,
  IconTrendingUp,
} from "@tabler/icons-react";

export type ExerciseCategory =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "cardio"
  | "flexibility"
  | "compound"
  | "other";

interface CategoryConfig {
  icon: Icon;
  color: string;
  bgColor: string;
  label: string;
}

export const categoryConfig: Record<ExerciseCategory, CategoryConfig> = {
  chest: {
    icon: IconShield,
    color: "var(--mantine-color-red-6)",
    bgColor: "var(--mantine-color-red-light)",
    label: "Chest",
  },
  back: {
    icon: IconStack2,
    color: "var(--mantine-color-blue-6)",
    bgColor: "var(--mantine-color-blue-light)",
    label: "Back",
  },
  shoulders: {
    icon: IconTarget,
    color: "var(--mantine-color-yellow-6)",
    bgColor: "var(--mantine-color-yellow-light)",
    label: "Shoulders",
  },
  arms: {
    icon: IconBolt,
    color: "var(--mantine-color-violet-6)",
    bgColor: "var(--mantine-color-violet-light)",
    label: "Arms",
  },
  legs: {
    icon: IconStretching,
    color: "var(--mantine-color-green-6)",
    bgColor: "var(--mantine-color-green-light)",
    label: "Legs",
  },
  core: {
    icon: IconFlame,
    color: "var(--mantine-color-orange-6)",
    bgColor: "var(--mantine-color-orange-light)",
    label: "Core",
  },
  cardio: {
    icon: IconHeart,
    color: "var(--mantine-color-pink-6)",
    bgColor: "var(--mantine-color-pink-light)",
    label: "Cardio",
  },
  flexibility: {
    icon: IconTrendingUp,
    color: "var(--mantine-color-teal-6)",
    bgColor: "var(--mantine-color-teal-light)",
    label: "Flexibility",
  },
  compound: {
    icon: IconBarbell,
    color: "var(--mantine-color-indigo-6)",
    bgColor: "var(--mantine-color-indigo-light)",
    label: "Compound",
  },
  other: {
    icon: IconDots,
    color: "var(--mantine-color-gray-6)",
    bgColor: "var(--mantine-color-gray-light)",
    label: "Other",
  },
};

// Map category to Mantine badge colors
const categoryColors: Record<ExerciseCategory, string> = {
  chest: "red",
  back: "blue",
  shoulders: "yellow",
  arms: "violet",
  legs: "green",
  core: "orange",
  cardio: "pink",
  flexibility: "teal",
  compound: "indigo",
  other: "gray",
};

interface CategoryBadgeProps {
  category: ExerciseCategory;
  showIcon?: boolean;
  size?: "sm" | "default";
}

export function CategoryBadge({ category, showIcon = true, size = "default" }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <Badge variant="light" color={categoryColors[category]} size={size === "sm" ? "xs" : "sm"}>
      <Group gap={4} wrap="nowrap">
        {showIcon && <Icon size={size === "sm" ? 12 : 14} />}
        {config.label}
      </Group>
    </Badge>
  );
}

export function getCategoryIcon(category: ExerciseCategory): Icon {
  return categoryConfig[category].icon;
}

export function getCategoryColor(category: ExerciseCategory): string {
  return categoryConfig[category].color;
}
