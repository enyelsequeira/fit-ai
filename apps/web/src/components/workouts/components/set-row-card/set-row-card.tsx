/**
 * SetRowCard - Enhanced set display and editing component
 * Features horizontal row layout with visual states, set type indicators, and previous set reference
 */

import type { ReactNode } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCheck, IconTrash } from "@tabler/icons-react";
import type { SetRowCardProps, SetType } from "./set-row-card.types";
import styles from "./set-row-card.module.css";

/**
 * Get badge color based on set type
 */
function getSetTypeColor(setType: SetType): string {
  const colorMap: Record<SetType, string> = {
    warmup: "orange",
    working: "blue",
    drop: "violet",
    failure: "red",
  };
  return colorMap[setType];
}

/**
 * Get set type label text
 */
function getSetTypeLabel(setType: SetType): string {
  const labelMap: Record<SetType, string> = {
    warmup: "Warmup",
    working: "Working",
    drop: "Drop",
    failure: "Failure",
  };
  return labelMap[setType];
}

/**
 * Input wrapper with suffix label for consistent styling
 */
function InputWithSuffix({ children, suffix }: { children: ReactNode; suffix: string }) {
  return (
    <Group gap={4} wrap="nowrap" className={styles.inputWrapper}>
      {children}
      <Text size="xs" c="dimmed" className={styles.inputSuffix}>
        {suffix}
      </Text>
    </Group>
  );
}

export function SetRowCard({ data, actions, previousSet, disabled = false }: SetRowCardProps) {
  const {
    setNumber,
    weight,
    reps,
    rpe,
    setType = "working",
    isCompleted = false,
    isCurrent = false,
  } = data;

  const { onWeightChange, onRepsChange, onRpeChange, onComplete, onDelete } = actions;

  const showSetTypeBadge = setType !== "working";

  const handleWeightChange = (value: string | number) => {
    onWeightChange(value === "" ? null : Number(value));
  };

  const handleRepsChange = (value: string | number) => {
    onRepsChange(value === "" ? null : Number(value));
  };

  const handleRpeChange = (value: string | number) => {
    onRpeChange?.(value === "" ? null : Number(value));
  };

  return (
    <Paper
      className={styles.card}
      data-completed={isCompleted}
      data-current={isCurrent}
      p="sm"
      radius="md"
      withBorder
    >
      <Group gap="sm" wrap="nowrap" align="center" className={styles.mainRow}>
        {/* Set Number Badge */}
        <Box className={styles.setNumberContainer}>
          <Box
            className={styles.setNumberBadge}
            data-completed={isCompleted}
            data-current={isCurrent}
          >
            <Text size="sm" fw={600} className={styles.setNumberText}>
              {setNumber}
            </Text>
          </Box>
          {showSetTypeBadge && (
            <Badge
              size="xs"
              variant="light"
              color={getSetTypeColor(setType)}
              className={styles.setTypeBadge}
            >
              {getSetTypeLabel(setType)}
            </Badge>
          )}
        </Box>

        {/* Inputs Section */}
        <Stack gap={4} className={styles.inputsSection}>
          <Group gap="md" wrap="nowrap">
            {/* Weight Input */}
            <InputWithSuffix suffix="kg">
              <NumberInput
                value={weight ?? ""}
                onChange={handleWeightChange}
                size="sm"
                min={0}
                step={2.5}
                decimalScale={1}
                hideControls
                placeholder="0"
                disabled={disabled || isCompleted}
                classNames={{ input: styles.numberInput }}
                w={70}
                aria-label={`Weight for set ${setNumber}`}
              />
            </InputWithSuffix>

            {/* Reps Input */}
            <InputWithSuffix suffix="reps">
              <NumberInput
                value={reps ?? ""}
                onChange={handleRepsChange}
                size="sm"
                min={0}
                step={1}
                hideControls
                placeholder="0"
                disabled={disabled || isCompleted}
                classNames={{ input: styles.numberInput }}
                w={55}
                aria-label={`Reps for set ${setNumber}`}
              />
            </InputWithSuffix>

            {/* RPE Input (optional, smaller) */}
            {onRpeChange && (
              <InputWithSuffix suffix="RPE">
                <NumberInput
                  value={rpe ?? ""}
                  onChange={handleRpeChange}
                  size="xs"
                  min={1}
                  max={10}
                  step={0.5}
                  decimalScale={1}
                  hideControls
                  placeholder="-"
                  disabled={disabled || isCompleted}
                  classNames={{ input: styles.rpeInput }}
                  w={45}
                  aria-label={`RPE for set ${setNumber}`}
                />
              </InputWithSuffix>
            )}
          </Group>

          {/* Previous Set Reference */}
          {previousSet && (
            <Text size="xs" c="dimmed" className={styles.previousSet}>
              Prev: {previousSet.weight} kg x {previousSet.reps} reps
            </Text>
          )}
        </Stack>

        {/* Actions Section */}
        <Group gap="xs" wrap="nowrap" className={styles.actionsSection}>
          {/* Complete Button */}
          <Tooltip label={isCompleted ? "Set completed" : "Complete set"} position="top" withArrow>
            <ActionIcon
              variant={isCompleted ? "filled" : "light"}
              color={isCompleted ? "green" : "gray"}
              size="xl"
              onClick={onComplete}
              disabled={disabled}
              className={styles.completeButton}
              aria-label={isCompleted ? `Set ${setNumber} completed` : `Complete set ${setNumber}`}
            >
              <IconCheck size={24} stroke={isCompleted ? 3 : 2} />
            </ActionIcon>
          </Tooltip>

          {/* Delete Button (optional) */}
          {onDelete && !isCompleted && (
            <Tooltip label="Delete set" position="top" withArrow>
              <ActionIcon
                variant="subtle"
                color="red"
                size="lg"
                onClick={onDelete}
                disabled={disabled}
                className={styles.deleteButton}
                aria-label={`Delete set ${setNumber}`}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
    </Paper>
  );
}
