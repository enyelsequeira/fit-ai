import type { LucideIcon } from "lucide-react";

import {
  Dumbbell,
  Flame,
  Heart,
  Layers,
  MoreHorizontal,
  PersonStanding,
  Shield,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
}

export const categoryConfig: Record<ExerciseCategory, CategoryConfig> = {
  chest: {
    icon: Shield,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    label: "Chest",
  },
  back: {
    icon: Layers,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    label: "Back",
  },
  shoulders: {
    icon: Target,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    label: "Shoulders",
  },
  arms: {
    icon: Zap,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    label: "Arms",
  },
  legs: {
    icon: PersonStanding,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    label: "Legs",
  },
  core: {
    icon: Flame,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    label: "Core",
  },
  cardio: {
    icon: Heart,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    label: "Cardio",
  },
  flexibility: {
    icon: TrendingUp,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    label: "Flexibility",
  },
  compound: {
    icon: Dumbbell,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    label: "Compound",
  },
  other: {
    icon: MoreHorizontal,
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    label: "Other",
  },
};

interface CategoryBadgeProps {
  category: ExerciseCategory;
  showIcon?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export function CategoryBadge({
  category,
  showIcon = true,
  size = "default",
  className,
}: CategoryBadgeProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        config.bgColor,
        config.color,
        "border-transparent",
        size === "sm" && "px-1.5 py-0 text-[10px]",
        className,
      )}
    >
      {showIcon && <Icon className={cn("mr-1", size === "sm" ? "size-3" : "size-3.5")} />}
      {config.label}
    </Badge>
  );
}

export function getCategoryIcon(category: ExerciseCategory): LucideIcon {
  return categoryConfig[category].icon;
}

export function getCategoryColor(category: ExerciseCategory): string {
  return categoryConfig[category].color;
}
