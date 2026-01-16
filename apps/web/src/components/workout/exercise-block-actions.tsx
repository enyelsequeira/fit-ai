import { IconChevronDown, IconChevronUp, IconDotsVertical, IconTrash } from "@tabler/icons-react";

import { ActionIcon, Menu } from "@mantine/core";

interface ExerciseBlockActionsProps {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemoveExercise: () => void;
}

function ExerciseBlockActions({
  onMoveUp,
  onMoveDown,
  onRemoveExercise,
}: ExerciseBlockActionsProps) {
  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" size="sm" onClick={(e) => e.stopPropagation()}>
          <IconDotsVertical style={{ width: 16, height: 16 }} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {onMoveUp && (
          <Menu.Item
            onClick={onMoveUp}
            leftSection={<IconChevronUp style={{ width: 16, height: 16 }} />}
          >
            Move Up
          </Menu.Item>
        )}
        {onMoveDown && (
          <Menu.Item
            onClick={onMoveDown}
            leftSection={<IconChevronDown style={{ width: 16, height: 16 }} />}
          >
            Move Down
          </Menu.Item>
        )}
        {(onMoveUp || onMoveDown) && <Menu.Divider />}
        <Menu.Item
          onClick={onRemoveExercise}
          color="red"
          leftSection={<IconTrash style={{ width: 16, height: 16 }} />}
        >
          Remove Exercise
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export { ExerciseBlockActions };
