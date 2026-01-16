/**
 * EnergyMoodSection - Energy level, mood, and motivation inputs for check-in form
 */

import { Box, Group, Slider, Stack, Text, UnstyledButton } from "@mantine/core";
import type { Mood } from "./types";
import { MOODS } from "./types";
import styles from "../recovery-view.module.css";

interface EnergyMoodSectionProps {
  energyLevel: number;
  motivationLevel: number;
  mood: Mood | undefined;
  onEnergyChange: (value: number) => void;
  onMotivationChange: (value: number) => void;
  onMoodChange: (value: Mood) => void;
}

export function EnergyMoodSection({
  energyLevel,
  motivationLevel,
  mood,
  onEnergyChange,
  onMotivationChange,
  onMoodChange,
}: EnergyMoodSectionProps) {
  return (
    <Box className={styles.formSection}>
      <Box className={styles.formSectionHeader}>
        <Text fz="sm" fw={500}>
          Energy & Mood
        </Text>
      </Box>
      <Box className={styles.formSectionContent}>
        <Stack gap="md">
          <Box>
            <Group justify="space-between" mb="xs">
              <Text fz="sm" fw={500}>
                Energy Level
              </Text>
              <Text fz="sm" fw={500} style={{ fontVariantNumeric: "tabular-nums" }}>
                {energyLevel}/10
              </Text>
            </Group>
            <Slider value={energyLevel} onChange={onEnergyChange} min={1} max={10} step={1} />
          </Box>

          <Box>
            <Text fz="sm" fw={500} mb="xs">
              Mood
            </Text>
            <Group gap="xs">
              {MOODS.map((moodOption) => (
                <UnstyledButton
                  key={moodOption.value}
                  onClick={() => onMoodChange(moodOption.value)}
                  className={styles.moodButton}
                  data-selected={mood === moodOption.value}
                >
                  <Text fz="md">{moodOption.emoji}</Text>
                  <Text fz="xs">{moodOption.label}</Text>
                </UnstyledButton>
              ))}
            </Group>
          </Box>

          <Box>
            <Group justify="space-between" mb="xs">
              <Text fz="sm" fw={500}>
                Motivation
              </Text>
              <Text fz="sm" fw={500} style={{ fontVariantNumeric: "tabular-nums" }}>
                {motivationLevel}/10
              </Text>
            </Group>
            <Slider
              value={motivationLevel}
              onChange={onMotivationChange}
              min={1}
              max={10}
              step={1}
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
