/**
 * PhysicalSection - Soreness, sore areas, and stress inputs for check-in form
 */

import { Box, Group, SimpleGrid, Slider, Stack, Text, UnstyledButton } from "@mantine/core";
import { BODY_PARTS } from "./types";
import styles from "../recovery-view.module.css";

interface PhysicalSectionProps {
  sorenessLevel: number;
  stressLevel: number;
  soreAreas: string[];
  onSorenessChange: (value: number) => void;
  onStressChange: (value: number) => void;
  onToggleSoreArea: (area: string) => void;
}

export function PhysicalSection({
  sorenessLevel,
  stressLevel,
  soreAreas,
  onSorenessChange,
  onStressChange,
  onToggleSoreArea,
}: PhysicalSectionProps) {
  return (
    <Box className={styles.formSection}>
      <Box className={styles.formSectionHeader}>
        <Text fz="sm" fw={500}>
          Physical
        </Text>
      </Box>
      <Box className={styles.formSectionContent}>
        <Stack gap="md">
          <Box>
            <Group justify="space-between" mb="xs">
              <Text fz="sm" fw={500}>
                Overall Soreness
              </Text>
              <Text fz="sm" fw={500} style={{ fontVariantNumeric: "tabular-nums" }}>
                {sorenessLevel}/10
              </Text>
            </Group>
            <Slider value={sorenessLevel} onChange={onSorenessChange} min={1} max={10} step={1} />
          </Box>

          <Box>
            <Text fz="sm" fw={500} mb="xs">
              Sore Areas
            </Text>
            <SimpleGrid cols={3} spacing="xs">
              {BODY_PARTS.map((part) => (
                <UnstyledButton
                  key={part}
                  onClick={() => onToggleSoreArea(part)}
                  className={styles.bodyPartButton}
                  data-selected={soreAreas.includes(part)}
                >
                  <Text fz="xs" ta="center">
                    {part}
                  </Text>
                </UnstyledButton>
              ))}
            </SimpleGrid>
          </Box>

          <Box>
            <Group justify="space-between" mb="xs">
              <Text fz="sm" fw={500}>
                Stress Level
              </Text>
              <Text fz="sm" fw={500} style={{ fontVariantNumeric: "tabular-nums" }}>
                {stressLevel}/10
              </Text>
            </Group>
            <Slider value={stressLevel} onChange={onStressChange} min={1} max={10} step={1} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
