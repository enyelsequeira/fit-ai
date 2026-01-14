/**
 * GoalTypeSelector - Grid for selecting goal type in the wizard
 */

import { Center, SimpleGrid, Text, UnstyledButton } from "@mantine/core";
import {
  IconCalendar,
  IconChartLine,
  IconScale,
  IconStretching,
  IconTarget,
} from "@tabler/icons-react";
import type { GoalType } from "./types";
import { GOAL_TYPES } from "./constants";
import styles from "./goals-view.module.css";

const GOAL_TYPE_ICONS = {
  weight: IconScale,
  strength: IconStretching,
  body_measurement: IconTarget,
  workout_frequency: IconCalendar,
  custom: IconChartLine,
} as const;

interface GoalTypeSelectorProps {
  selectedType: GoalType | null;
  onSelect: (type: GoalType) => void;
}

export function GoalTypeSelector({ selectedType, onSelect }: GoalTypeSelectorProps) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
      {GOAL_TYPES.map((goalType) => {
        const Icon = GOAL_TYPE_ICONS[goalType.type];
        return (
          <UnstyledButton
            key={goalType.type}
            className={styles.typeCard}
            data-selected={selectedType === goalType.type}
            onClick={() => onSelect(goalType.type)}
          >
            <Center
              w={48}
              h={48}
              mb="xs"
              style={{
                borderRadius: "var(--mantine-radius-md)",
                background: `var(--mantine-color-${goalType.color}-light)`,
                color: `var(--mantine-color-${goalType.color}-6)`,
              }}
            >
              <Icon size={24} />
            </Center>
            <Text fw={500} fz="sm" ta="center">
              {goalType.label}
            </Text>
            <Text fz="xs" c="dimmed" ta="center">
              {goalType.description}
            </Text>
          </UnstyledButton>
        );
      })}
    </SimpleGrid>
  );
}
