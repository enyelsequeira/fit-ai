import { Box, Button, Loader, Stack, Text } from "@mantine/core";
import { IconLayoutList, IconPlus, IconTemplate } from "@tabler/icons-react";
import styles from "./template-detail-modal.module.css";

// ============================================================================
// Empty Days View (prompts user to create first day)
// ============================================================================

interface EmptyDaysViewProps {
  templateId: number;
  onAddDay: () => void;
  isCreatingDay: boolean;
}

export function EmptyDaysView({ onAddDay, isCreatingDay }: EmptyDaysViewProps) {
  return (
    <Box className={styles.tabsContainer}>
      <Stack align="center" py="xl" gap="md">
        <Box className={styles.emptyIcon}>
          <IconLayoutList size={32} />
        </Box>
        <Text size="lg" fw={600} c="dimmed">
          No Workout Days
        </Text>
        <Text size="sm" c="dimmed" ta="center" maw={300}>
          This template needs at least one workout day. Add a day to start building your routine.
        </Text>
        <Button
          variant="filled"
          leftSection={<IconPlus size={16} />}
          onClick={onAddDay}
          loading={isCreatingDay}
        >
          Add First Day
        </Button>
      </Stack>
    </Box>
  );
}

// ============================================================================
// Empty Template State
// ============================================================================

export function EmptyTemplateState() {
  return (
    <Box className={styles.emptyState}>
      <Box className={styles.emptyIcon}>
        <IconTemplate size={28} />
      </Box>
      <Text className={styles.emptyTitle}>Template not found</Text>
      <Text className={styles.emptyDescription}>
        The template you&apos;re looking for doesn&apos;t exist or has been deleted.
      </Text>
    </Box>
  );
}

// ============================================================================
// Loading State
// ============================================================================

export function LoadingState() {
  return (
    <Box className={styles.loadingState}>
      <Loader size="lg" />
      <Text className={styles.loadingText}>Loading template...</Text>
    </Box>
  );
}
