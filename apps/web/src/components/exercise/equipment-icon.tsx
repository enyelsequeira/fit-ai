import type { Icon } from "@tabler/icons-react";

import { Group, Text } from "@mantine/core";
import {
  IconBarbell,
  IconCircle,
  IconLink,
  IconScale,
  IconSettings,
  IconSquare,
  IconStretching,
} from "@tabler/icons-react";

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
  icon: Icon;
  label: string;
}

export const equipmentConfig: Record<NonNullable<EquipmentType>, EquipmentConfig> = {
  barbell: {
    icon: IconScale,
    label: "Barbell",
  },
  dumbbell: {
    icon: IconBarbell,
    label: "Dumbbell",
  },
  cable: {
    icon: IconLink,
    label: "Cable",
  },
  machine: {
    icon: IconSettings,
    label: "Machine",
  },
  bodyweight: {
    icon: IconStretching,
    label: "Bodyweight",
  },
  kettlebell: {
    icon: IconCircle,
    label: "Kettlebell",
  },
  bands: {
    icon: IconSquare,
    label: "Bands",
  },
  other: {
    icon: IconCircle,
    label: "Other",
  },
};

interface EquipmentIconProps {
  equipment: EquipmentType;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
}

const iconSizes = {
  sm: 12,
  default: 16,
  lg: 20,
};

export function EquipmentIcon({
  equipment,
  showLabel = false,
  size = "default",
}: EquipmentIconProps) {
  if (!equipment) return null;

  const config = equipmentConfig[equipment] || equipmentConfig.other;
  const Icon = config.icon;

  return (
    <Group gap={4} wrap="nowrap" c="dimmed">
      <Icon size={iconSizes[size]} />
      {showLabel && <Text fz="xs">{config.label}</Text>}
    </Group>
  );
}

export function getEquipmentLabel(equipment: EquipmentType): string {
  if (!equipment) return "None";
  return equipmentConfig[equipment]?.label || "Other";
}
