/**
 * NotesSection - Free-form notes input for check-in form
 */

import { Box, Text, Textarea } from "@mantine/core";
import styles from "../recovery-view.module.css";

interface NotesSectionProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export function NotesSection({ notes, onNotesChange }: NotesSectionProps) {
  return (
    <Box className={styles.formSection}>
      <Box className={styles.formSectionHeader}>
        <Text fz="sm" fw={500}>
          Notes
        </Text>
      </Box>
      <Box className={styles.formSectionContent}>
        <Textarea
          placeholder="How are you feeling today? Any additional notes..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          minRows={3}
        />
      </Box>
    </Box>
  );
}
