import { ActionIcon, Box, Flex, Menu, Stack, Text, Tooltip } from "@mantine/core";
import {
  IconBarbell,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconDotsVertical,
  IconEdit,
  IconGripVertical,
  IconRepeat,
  IconTrash,
  IconWeight,
} from "@tabler/icons-react";
import { useRemoveExercise, useReorderExercises } from "../hooks/use-mutations";
import type { TemplateExercise } from "../types";
import styles from "./template-detail/template-detail-modal.module.css";

interface ExerciseItemProps {
  exercise: TemplateExercise;
  index: number;
  totalCount: number;
  isEditing: boolean;
  templateId: number;
  dayId: number;
  exercises: TemplateExercise[];
  onEdit: () => void;
}

export function ExerciseItem({
  exercise,
  index,
  totalCount,
  isEditing,
  templateId,
  dayId,
  exercises,
  onEdit,
}: ExerciseItemProps) {
  const removeExerciseMutation = useRemoveExercise(templateId, dayId);
  const reorderExercisesMutation = useReorderExercises(templateId, dayId);

  const hasTargets =
    exercise.targetSets || exercise.targetReps || exercise.targetWeight || exercise.restSeconds;

  const handleRemove = async () => {
    await removeExerciseMutation.mutateAsync({
      templateId,
      exerciseId: exercise.id,
    });
  };

  const handleMoveUp = async () => {
    if (index === 0) return;
    await handleMove(index, index - 1);
  };

  const handleMoveDown = async () => {
    if (index === totalCount - 1) return;
    await handleMove(index, index + 1);
  };

  const handleMove = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= exercises.length) return;

    const items = Array.from(exercises);
    const movedItem = items[fromIndex];
    if (movedItem) {
      items.splice(fromIndex, 1);
      items.splice(toIndex, 0, movedItem);
    }

    const exerciseIds = items.map((item) => item.id);
    await reorderExercisesMutation.mutateAsync({
      id: templateId,
      exerciseIds,
    });
  };

  return (
    <Box className={styles.exerciseItem} data-editing={isEditing}>
      <Flex className={styles.exerciseItemContent}>
        <Box className={styles.dragHandle}>
          <Box className={styles.orderNumber}>{index + 1}</Box>
          <Tooltip label="Drag to reorder" position="left" withArrow>
            <ActionIcon variant="subtle" size="xs" color="gray">
              <IconGripVertical size={14} />
            </ActionIcon>
          </Tooltip>
          <Stack gap={2} mt="xs">
            <Tooltip label="Move up" withArrow>
              <ActionIcon
                variant="subtle"
                size="xs"
                onClick={handleMoveUp}
                disabled={index === 0}
                color="gray"
              >
                <IconChevronUp size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Move down" withArrow>
              <ActionIcon
                variant="subtle"
                size="xs"
                onClick={handleMoveDown}
                disabled={index === totalCount - 1}
                color="gray"
              >
                <IconChevronDown size={14} />
              </ActionIcon>
            </Tooltip>
          </Stack>
        </Box>

        <Box className={styles.exerciseInfo}>
          <Box className={styles.exerciseHeader}>
            <Tooltip label={exercise.exercise?.category ?? "Exercise"} withArrow>
              <Box className={styles.exerciseIcon}>
                <IconBarbell size={18} />
              </Box>
            </Tooltip>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text className={styles.exerciseName}>
                {exercise.exercise?.name ?? "Unknown Exercise"}
              </Text>
              <Text className={styles.exerciseCategory}>{exercise.exercise?.category ?? ""}</Text>
            </Box>
          </Box>

          {hasTargets && (
            <Flex className={styles.targetsRow}>
              {exercise.targetSets && (
                <TargetBadge
                  icon={<IconRepeat size={12} />}
                  label="Sets"
                  value={String(exercise.targetSets)}
                />
              )}
              {exercise.targetReps && (
                <TargetBadge
                  icon={<IconBarbell size={12} />}
                  label="Reps"
                  value={exercise.targetReps}
                />
              )}
              {exercise.targetWeight && (
                <TargetBadge
                  icon={<IconWeight size={12} />}
                  label="Weight"
                  value={`${exercise.targetWeight}kg`}
                />
              )}
              {exercise.restSeconds && (
                <TargetBadge
                  icon={<IconClock size={12} />}
                  label="Rest"
                  value={`${exercise.restSeconds}s`}
                />
              )}
            </Flex>
          )}

          {exercise.notes && <Box className={styles.exerciseNotes}>{exercise.notes}</Box>}
        </Box>

        <Box className={styles.exerciseActions}>
          <Menu shadow="md" position="bottom-end" withinPortal>
            <Menu.Target>
              <Tooltip label="More actions" withArrow>
                <ActionIcon variant="subtle" size="sm" color="gray">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEdit size={14} />} onClick={onEdit}>
                Edit targets
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={handleRemove}>
                Remove
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Box>
      </Flex>
    </Box>
  );
}

interface TargetBadgeProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export function TargetBadge({ icon, label, value }: TargetBadgeProps) {
  return (
    <Tooltip label={label} withArrow>
      <Box className={styles.targetItem}>
        {icon}
        <Text className={styles.targetValue}>{value}</Text>
      </Box>
    </Tooltip>
  );
}
