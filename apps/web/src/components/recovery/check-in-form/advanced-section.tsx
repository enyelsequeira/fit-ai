/**
 * AdvancedSection - Optional resting heart rate and HRV inputs for check-in form
 * Uses useToggle for expandable state
 */

import { Box, Collapse, NumberInput, SimpleGrid, Text, UnstyledButton } from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import styles from "../recovery-view.module.css";

interface AdvancedSectionProps {
  restingHeartRate: number | undefined;
  hrvScore: number | undefined;
  onRestingHeartRateChange: (value: number | undefined) => void;
  onHrvScoreChange: (value: number | undefined) => void;
  defaultExpanded?: boolean;
}

export function AdvancedSection({
  restingHeartRate,
  hrvScore,
  onRestingHeartRateChange,
  onHrvScoreChange,
  defaultExpanded = false,
}: AdvancedSectionProps) {
  const [expanded, toggleExpanded] = useToggle([defaultExpanded, !defaultExpanded]);

  return (
    <Box className={styles.formSection}>
      <Box className={styles.formSectionHeader}>
        <UnstyledButton onClick={() => toggleExpanded()} className={styles.advancedToggle}>
          <Text fz="sm" fw={500}>
            Advanced (Optional)
          </Text>
          <Text fz="xs" c="dimmed" className={styles.advancedToggleText}>
            {expanded ? "Hide" : "Show"}
          </Text>
        </UnstyledButton>
      </Box>
      <Collapse in={expanded}>
        <Box className={styles.formSectionContent}>
          <SimpleGrid cols={2} spacing="md">
            <NumberInput
              label="Resting Heart Rate (BPM)"
              placeholder="e.g., 60"
              value={restingHeartRate ?? ""}
              onChange={(value) =>
                onRestingHeartRateChange(typeof value === "number" ? value : undefined)
              }
              min={30}
              max={200}
            />
            <NumberInput
              label="HRV Score"
              placeholder="e.g., 45"
              value={hrvScore ?? ""}
              onChange={(value) => onHrvScoreChange(typeof value === "number" ? value : undefined)}
              min={0}
            />
          </SimpleGrid>
        </Box>
      </Collapse>
    </Box>
  );
}
