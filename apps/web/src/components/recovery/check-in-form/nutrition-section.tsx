/**
 * NutritionSection - Nutrition quality and hydration level inputs for check-in form
 */

import { Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import styles from "../recovery-view.module.css";

interface NutritionSectionProps {
  nutritionQuality: number;
  hydrationLevel: number;
  onNutritionChange: (value: number) => void;
  onHydrationChange: (value: number) => void;
}

export function NutritionSection({
  nutritionQuality,
  hydrationLevel,
  onNutritionChange,
  onHydrationChange,
}: NutritionSectionProps) {
  return (
    <Box className={styles.formSection}>
      <Box className={styles.formSectionHeader}>
        <Text fz="sm" fw={500}>
          Nutrition & Hydration
        </Text>
      </Box>
      <Box className={styles.formSectionContent}>
        <Stack gap="md">
          <Box>
            <Text fz="sm" fw={500} mb="xs">
              Nutrition Quality
            </Text>
            <Group gap="xs">
              {[1, 2, 3, 4, 5].map((star) => (
                <UnstyledButton
                  key={star}
                  onClick={() => onNutritionChange(star)}
                  className={styles.ratingButton}
                  data-selected={nutritionQuality >= star}
                  data-rating-type="nutrition"
                >
                  <Text fz="lg">*</Text>
                </UnstyledButton>
              ))}
            </Group>
          </Box>

          <Box>
            <Text fz="sm" fw={500} mb="xs">
              Hydration Level
            </Text>
            <Group gap="xs">
              {[1, 2, 3, 4, 5].map((drop) => (
                <UnstyledButton
                  key={drop}
                  onClick={() => onHydrationChange(drop)}
                  className={styles.ratingButton}
                  data-selected={hydrationLevel >= drop}
                  data-rating-type="hydration"
                >
                  <Text fz="sm">~</Text>
                </UnstyledButton>
              ))}
            </Group>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
