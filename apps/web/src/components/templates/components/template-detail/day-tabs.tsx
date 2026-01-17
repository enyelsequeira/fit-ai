import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Group,
  Menu,
  ScrollArea,
  Tabs,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconBed, IconDotsVertical, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import type { TemplateDay } from "../../types.ts";
import { DayExerciseContent, RestDayContent } from "./day-content.tsx";
import styles from "./template-detail-modal.module.css";

// ============================================================================
// Day-Based View Component
// ============================================================================

export interface DayBasedViewProps {
  days: TemplateDay[];
  activeDay: string | null;
  setActiveDay: (day: string | null) => void;
  activeDayData: TemplateDay | undefined;
  templateId: number;
  editingExerciseId: number | null;
  setEditingExerciseId: (id: number | null) => void;
  editingDayId: number | null;
  editingDayName: string;
  setEditingDayName: (name: string) => void;
  deleteConfirmDayId: number | null;
  setDeleteConfirmDayId: (id: number | null) => void;
  excludeExerciseIds: number[];
  onAddDay: () => void;
  onStartEditDay: (dayId: number, currentName: string) => void;
  onSaveDayName: () => void;
  onCancelEditDay: () => void;
  onToggleRestDay: (dayId: number, isRestDay: boolean) => void;
  onDeleteDay: (dayId: number) => void;
  isCreatingDay: boolean;
  isDeletingDay: boolean;
}

export function DayBasedView({
  days,
  activeDay,
  setActiveDay,
  activeDayData,
  templateId,
  editingExerciseId,
  setEditingExerciseId,
  editingDayId,
  editingDayName,
  setEditingDayName,
  setDeleteConfirmDayId,
  excludeExerciseIds,
  onAddDay,
  onStartEditDay,
  onSaveDayName,
  onCancelEditDay,
  onToggleRestDay,
  isCreatingDay,
}: DayBasedViewProps) {
  return (
    <Box className={styles.tabsContainer}>
      <Tabs value={activeDay} onChange={setActiveDay}>
        <ScrollArea scrollbarSize={6} type="auto">
          <Tabs.List className={styles.dayTabsList}>
            {days.map((day) => (
              <DayTab
                key={day.id}
                day={day}
                isActive={activeDay === String(day.id)}
                isEditing={editingDayId === day.id}
                editingName={editingDayName}
                setEditingName={setEditingDayName}
                onStartEdit={() => onStartEditDay(day.id, day.name)}
                onSaveName={onSaveDayName}
                onCancelEdit={onCancelEditDay}
                onToggleRestDay={() => onToggleRestDay(day.id, day.isRestDay)}
                onDelete={() => setDeleteConfirmDayId(day.id)}
              />
            ))}
            <Tooltip label="Add new day" position="bottom" withArrow>
              <Button
                variant="subtle"
                size="compact-sm"
                leftSection={<IconPlus size={14} />}
                onClick={onAddDay}
                loading={isCreatingDay}
                className={styles.addDayButton}
              >
                Add Day
              </Button>
            </Tooltip>
          </Tabs.List>
        </ScrollArea>

        {days.map((day) => (
          <Tabs.Panel key={day.id} value={String(day.id)} pt="md">
            {day.isRestDay ? (
              <RestDayContent day={day} />
            ) : (
              <DayExerciseContent
                day={day}
                templateId={templateId}
                editingExerciseId={editingExerciseId}
                setEditingExerciseId={setEditingExerciseId}
                excludeExerciseIds={excludeExerciseIds}
              />
            )}
          </Tabs.Panel>
        ))}
      </Tabs>

      {activeDayData === undefined && days.length > 0 && (
        <Box className={styles.emptyState} mt="md">
          <Text c="dimmed" ta="center">
            Select a day to view exercises
          </Text>
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// Day Tab Component
// ============================================================================

interface DayTabProps {
  day: TemplateDay;
  isActive: boolean;
  isEditing: boolean;
  editingName: string;
  setEditingName: (name: string) => void;
  onStartEdit: () => void;
  onSaveName: () => void;
  onCancelEdit: () => void;
  onToggleRestDay: () => void;
  onDelete: () => void;
}

function DayTab({
  day,
  isEditing,
  editingName,
  setEditingName,
  onStartEdit,
  onSaveName,
  onCancelEdit,
  onToggleRestDay,
  onDelete,
}: DayTabProps) {
  const exerciseCount = day.exercises?.length ?? 0;

  if (isEditing) {
    return (
      <Box className={styles.dayTabEditing}>
        <TextInput
          size="xs"
          value={editingName}
          onChange={(e) => setEditingName(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSaveName();
            if (e.key === "Escape") onCancelEdit();
          }}
          autoFocus
          className={styles.dayNameInput}
        />
        <Group gap={4}>
          <Button size="compact-xs" variant="filled" onClick={onSaveName}>
            Save
          </Button>
          <Button size="compact-xs" variant="subtle" onClick={onCancelEdit}>
            Cancel
          </Button>
        </Group>
      </Box>
    );
  }

  return (
    <Tabs.Tab
      value={String(day.id)}
      className={styles.dayTab}
      leftSection={day.isRestDay ? <IconBed size={14} /> : undefined}
      rightSection={
        <Group gap={4} wrap="nowrap">
          {!day.isRestDay && exerciseCount > 0 && (
            <Badge size="xs" variant="light" color="blue" className={styles.exerciseCountBadge}>
              {exerciseCount}
            </Badge>
          )}
          <Menu position="bottom-end" withinPortal shadow="md">
            <Menu.Target>
              <ActionIcon
                size="xs"
                variant="subtle"
                color="gray"
                onClick={(e) => e.stopPropagation()}
              >
                <IconDotsVertical size={12} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEdit size={14} />} onClick={onStartEdit}>
                Rename
              </Menu.Item>
              <Menu.Item
                leftSection={<IconBed size={14} />}
                onClick={onToggleRestDay}
                rightSection={<Checkbox size="xs" checked={day.isRestDay} readOnly tabIndex={-1} />}
              >
                Rest Day
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={onDelete}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      }
    >
      <Text size="sm" className={day.isRestDay ? styles.restDayText : undefined}>
        {day.name}
      </Text>
    </Tabs.Tab>
  );
}
