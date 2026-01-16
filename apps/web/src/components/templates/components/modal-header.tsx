/**
 * ModalHeader - Header section for template detail modal
 * Contains template title, description, close button, and stats grid
 */

import { Box, CloseButton, Text, Tooltip } from "@mantine/core";
import {
  IconBarbell,
  IconClock,
  IconEye,
  IconEyeOff,
  IconTemplate,
  IconTrendingUp,
} from "@tabler/icons-react";
import type { TemplateExercise } from "../types";
import { formatDuration } from "../utils";
import styles from "./template-detail/template-detail-modal.module.css";

interface ModalHeaderProps {
  template: {
    name: string;
    description: string | null;
    estimatedDurationMinutes: number | null;
    isPublic: boolean;
    timesUsed: number;
    exercises: TemplateExercise[];
  };
  onClose: () => void;
}

export function ModalHeader({ template, onClose }: ModalHeaderProps) {
  return (
    <Box className={styles.header}>
      <Box className={styles.titleSection}>
        <Tooltip label="Workout Template" withArrow>
          <Box className={styles.iconWrapper}>
            <IconTemplate size={24} />
          </Box>
        </Tooltip>
        <Box className={styles.titleContent}>
          <Text className={styles.templateName}>{template.name}</Text>
          {template.description && (
            <Text className={styles.templateDescription}>{template.description}</Text>
          )}
        </Box>
        <Tooltip label="Close modal" withArrow>
          <CloseButton size="lg" onClick={onClose} />
        </Tooltip>
      </Box>

      <Box className={styles.statsGrid}>
        <StatCard
          icon={<IconClock size={18} />}
          value={formatDuration(template.estimatedDurationMinutes)}
          label="Duration"
          variant="duration"
          tooltip="Estimated workout duration"
        />
        <StatCard
          icon={<IconBarbell size={18} />}
          value={String(template.exercises.length)}
          label="Exercises"
          variant="exercises"
          tooltip="Number of exercises in template"
        />
        <StatCard
          icon={<IconTrendingUp size={18} />}
          value={String(template.timesUsed)}
          label="Times Used"
          variant="usage"
          tooltip="How many times this template has been used"
        />
        <StatCard
          icon={template.isPublic ? <IconEye size={18} /> : <IconEyeOff size={18} />}
          value={template.isPublic ? "Public" : "Private"}
          label="Visibility"
          variant="visibility"
          tooltip={template.isPublic ? "Visible to other users" : "Only visible to you"}
        />
      </Box>
    </Box>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  variant: "duration" | "exercises" | "usage" | "visibility";
  tooltip: string;
}

export function StatCard({ icon, value, label, variant, tooltip }: StatCardProps) {
  return (
    <Tooltip label={tooltip} withArrow>
      <Box className={styles.statCard}>
        <Box className={`${styles.statIcon} ${styles[variant]}`}>{icon}</Box>
        <Text className={styles.statValue}>{value}</Text>
        <Text className={styles.statLabel}>{label}</Text>
      </Box>
    </Tooltip>
  );
}
