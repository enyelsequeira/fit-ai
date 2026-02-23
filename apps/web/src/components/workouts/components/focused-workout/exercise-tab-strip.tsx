/**
 * ExerciseTabStrip - Horizontal scrollable exercise navigation
 * Uses Mantine Tabs (pills variant) + ScrollArea for proper semantics.
 * Replaces the hidden swipe carousel + collapsible queue.
 */

import { Badge, ScrollArea, Tabs } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

import styles from "./exercise-tab-strip.module.css";

export type ExerciseTabItem = {
  id: number;
  name: string;
  completedSets: number;
  totalSets: number;
  status: "completed" | "current" | "pending";
};

type ExerciseTabStripProps = {
  exercises: ExerciseTabItem[];
  currentIndex: number;
  onSelectExercise: (index: number) => void;
};

export function ExerciseTabStrip({
  exercises,
  currentIndex,
  onSelectExercise,
}: ExerciseTabStripProps) {
  if (exercises.length === 0) return null;

  return (
    <ScrollArea type="never" scrollbars="x" classNames={{ root: styles.scrollRoot }}>
      <Tabs
        value={String(currentIndex)}
        onChange={(val) => val !== null && onSelectExercise(Number(val))}
        variant="pills"
        classNames={{ list: styles.list, tab: styles.tab }}
      >
        <Tabs.List>
          {exercises.map((exercise, index) => {
            const isActive = index === currentIndex;
            const isCompleted = exercise.status === "completed";
            const truncated =
              exercise.name.length > 14 ? `${exercise.name.slice(0, 13)}…` : exercise.name;

            return (
              <Tabs.Tab
                key={exercise.id}
                value={String(index)}
                mod={{
                  completed: isCompleted,
                  active: isActive,
                }}
                leftSection={
                  isCompleted ? (
                    <IconCheck size={12} stroke={3} className={styles.checkIcon} />
                  ) : null
                }
                rightSection={
                  <Badge
                    size="xs"
                    variant={isActive ? "white" : "light"}
                    color={isCompleted ? "teal" : "gray"}
                    className={styles.badge}
                    mod={{ active: isActive, completed: isCompleted }}
                  >
                    {exercise.completedSets}/{exercise.totalSets}
                  </Badge>
                }
                aria-label={`${exercise.name}: ${exercise.completedSets} of ${exercise.totalSets} sets`}
              >
                {truncated}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs>
    </ScrollArea>
  );
}
