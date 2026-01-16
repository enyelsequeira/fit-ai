/**
 * TemplateExerciseItem - Individual exercise row with sets/reps and reordering controls
 */

import { ActionIcon, Box, Center, Flex, Group, Menu, Stack, Text } from "@mantine/core";
import {
  IconBarbell,
  IconChevronDown,
  IconChevronUp,
  IconDotsVertical,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import type { TemplateExercise } from "../types";
import styles from "./template-detail/template-detail-modal.module.css";

interface TemplateExerciseItemProps {
  exercise: TemplateExercise;
  index: number;
  totalCount: number;
  onEdit: (exercise: TemplateExercise) => void;
  onRemove: (exerciseId: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function TemplateExerciseItem({
  exercise,
  index,
  totalCount,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
}: TemplateExerciseItemProps) {
  return (
    <Flex gap="xs" align="flex-start" p="sm" className={styles.exerciseItem}>
      <Stack gap={2} align="center" py="xs">
        <ActionIcon variant="subtle" size="xs" onClick={onMoveUp} disabled={index === 0}>
          <IconChevronUp size={14} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          size="xs"
          onClick={onMoveDown}
          disabled={index === totalCount - 1}
        >
          <IconChevronDown size={14} />
        </ActionIcon>
      </Stack>

      <Box style={{ flex: 1, minWidth: 0 }}>
        <Group gap="xs" mb="xs">
          <Center w={28} h={28} className={styles.exerciseIcon}>
            <IconBarbell size={16} />
          </Center>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text fw={500} size="sm">
              {exercise.exercise?.name ?? "Unknown Exercise"}
            </Text>
            <Text size="xs" c="dimmed">
              {exercise.exercise?.category ?? ""}
            </Text>
          </Box>
        </Group>

        <Group gap="xs" mt="xs" wrap="wrap">
          {exercise.targetSets && (
            <Box ta="center" p="xs" className={styles.targetItem}>
              <Text size="xs" c="dimmed">
                Sets
              </Text>
              <Text size="sm" fw={500}>
                {exercise.targetSets}
              </Text>
            </Box>
          )}
          {exercise.targetReps && (
            <Box ta="center" p="xs" className={styles.targetItem}>
              <Text size="xs" c="dimmed">
                Reps
              </Text>
              <Text size="sm" fw={500}>
                {exercise.targetReps}
              </Text>
            </Box>
          )}
          {exercise.targetWeight && (
            <Box ta="center" p="xs" className={styles.targetItem}>
              <Text size="xs" c="dimmed">
                Weight
              </Text>
              <Text size="sm" fw={500}>
                {exercise.targetWeight} kg
              </Text>
            </Box>
          )}
          {exercise.restSeconds && (
            <Box ta="center" p="xs" className={styles.targetItem}>
              <Text size="xs" c="dimmed">
                Rest
              </Text>
              <Text size="sm" fw={500}>
                {exercise.restSeconds}s
              </Text>
            </Box>
          )}
        </Group>

        {exercise.notes && (
          <Text size="xs" c="dimmed" fs="italic" mt="xs" className={styles.exerciseNotes}>
            {exercise.notes}
          </Text>
        )}
      </Box>

      <Menu shadow="md" position="bottom-end" withinPortal>
        <Menu.Target>
          <ActionIcon variant="subtle" size="sm">
            <IconDotsVertical size={14} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit(exercise)}>
            Edit
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={() => onRemove(exercise.id)}
          >
            Remove
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Flex>
  );
}
