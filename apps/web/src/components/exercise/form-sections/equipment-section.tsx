import type { EquipmentType } from "../equipment-icon";

import { NativeSelect } from "@mantine/core";

import { equipmentConfig } from "../equipment-icon";

interface EquipmentSectionProps {
  equipment: NonNullable<EquipmentType> | null;
  onChange: (value: NonNullable<EquipmentType> | null) => void;
}

const equipmentOptions = [
  { value: "", label: "None / Bodyweight" },
  ...Object.entries(equipmentConfig).map(([key, config]) => ({
    value: key,
    label: config.label,
  })),
];

export function EquipmentSection({ equipment, onChange }: EquipmentSectionProps) {
  return (
    <NativeSelect
      label="Equipment"
      value={equipment || ""}
      onChange={(e) => {
        const value = e.target.value;
        onChange(value ? (value as NonNullable<EquipmentType>) : null);
      }}
      data={equipmentOptions}
    />
  );
}
