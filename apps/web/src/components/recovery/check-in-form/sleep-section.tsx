/**
 * SleepSection - Sleep hours and quality inputs for check-in form
 */

import { Box, Group, Slider, Stack, Text, UnstyledButton } from "@mantine/core";
import styles from "../recovery-view.module.css";

interface SleepSectionProps {
  sleepHours: number;
  sleepQuality: number;
  onSleepHoursChange: (value: number) => void;
  onSleepQualityChange: (value: number) => void;
}

export function SleepSection({
  sleepHours,
  sleepQuality,
  onSleepHoursChange,
  onSleepQualityChange,
}: SleepSectionProps) {
  return (
    <Box className={styles.formSection}>
      <Box className={styles.formSectionHeader}>
        <Text fz="sm" fw={500}>
          Sleep
        </Text>
      </Box>
      <Box className={styles.formSectionContent}>
        <Stack gap="md">
          <Box>
            <Group justify="space-between" mb="xs">
              <Text fz="sm" fw={500}>
                Hours of Sleep
              </Text>
              <Text fz="sm" fw={500} style={{ fontVariantNumeric: "tabular-nums" }}>
                {sleepHours} hours
              </Text>
            </Group>
            <Slider
              value={sleepHours}
              onChange={onSleepHoursChange}
              min={0}
              max={12}
              step={0.5}
              marks={[
                { value: 0, label: "0" },
                { value: 6, label: "6" },
                { value: 12, label: "12" },
              ]}
            />
          </Box>

          <Box>
            <Text fz="sm" fw={500} mb="xs">
              Sleep Quality
            </Text>
            <Group gap="xs">
              {[1, 2, 3, 4, 5].map((star) => (
                <UnstyledButton
                  key={star}
                  onClick={() => onSleepQualityChange(star)}
                  className={styles.ratingButton}
                  data-selected={sleepQuality >= star}
                  data-rating-type="sleep"
                >
                  <Text fz="lg">*</Text>
                </UnstyledButton>
              ))}
            </Group>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
