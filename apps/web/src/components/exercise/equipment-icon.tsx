import type { LucideIcon } from "lucide-react";

import { Circle, Dumbbell, Link, PersonStanding, Scale, Settings, Square } from "lucide-react";

import { cn } from "@/lib/utils";

export type EquipmentType =
  | "barbell"
  | "dumbbell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "kettlebell"
  | "bands"
  | "other"
  | null;

interface EquipmentConfig {
  icon: LucideIcon;
  label: string;
}

export const equipmentConfig: Record<NonNullable<EquipmentType>, EquipmentConfig> = {
  barbell: {
    icon: Scale,
    label: "Barbell",
  },
  dumbbell: {
    icon: Dumbbell,
    label: "Dumbbell",
  },
  cable: {
    icon: Link,
    label: "Cable",
  },
  machine: {
    icon: Settings,
    label: "Machine",
  },
  bodyweight: {
    icon: PersonStanding,
    label: "Bodyweight",
  },
  kettlebell: {
    icon: Circle,
    label: "Kettlebell",
  },
  bands: {
    icon: Square,
    label: "Bands",
  },
  other: {
    icon: Circle,
    label: "Other",
  },
};

interface EquipmentIconProps {
  equipment: EquipmentType;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function EquipmentIcon({
  equipment,
  showLabel = false,
  size = "default",
  className,
}: EquipmentIconProps) {
  if (!equipment) return null;

  const config = equipmentConfig[equipment] || equipmentConfig.other;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "size-3",
    default: "size-4",
    lg: "size-5",
  };

  return (
    <span className={cn("text-muted-foreground inline-flex items-center gap-1", className)}>
      <Icon className={sizeClasses[size]} />
      {showLabel && <span className="text-xs">{config.label}</span>}
    </span>
  );
}

export function getEquipmentLabel(equipment: EquipmentType): string {
  if (!equipment) return "None";
  return equipmentConfig[equipment]?.label || "Other";
}
