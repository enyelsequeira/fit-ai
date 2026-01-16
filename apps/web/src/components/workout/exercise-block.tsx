import { useState } from "react";

import { Box, Flex, Text } from "@mantine/core";

import { ExerciseBlockHeader } from "./exercise-block-header";
import type {
  Exercise,
  ExerciseBlockProps,
  ExerciseSet,
  PreviousPerformance,
} from "./exercise-block.types";
import { SimplePreviousPerformance } from "./previous-performance";
import { RestTimer } from "./rest-timer";
import { SetsList } from "./sets-list";

function ExerciseBlock({
  workoutExerciseId: _workoutExerciseId,
  exercise,
  sets,
  previousPerformance,
  supersetGroupId,
  notes,
  isExpanded: defaultExpanded = true,
  showRestTimer = false,
  restTimerSeconds = 90,
  weightUnit = "kg",
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onCompleteSet,
  onRemoveExercise,
  onMoveUp,
  onMoveDown,
}: ExerciseBlockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeRestTimer, setActiveRestTimer] = useState(false);

  const completedSets = sets.filter((s) => s.isCompleted).length;
  const totalSets = sets.length;

  const handleCompleteSet = (setId: number | string) => {
    onCompleteSet(setId);
    setActiveRestTimer(true);
  };

  const handleToggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Box
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderLeft: supersetGroupId ? "4px solid var(--mantine-color-blue-5)" : undefined,
        overflow: "hidden",
      }}
    >
      <ExerciseBlockHeader
        exercise={exercise}
        completedSets={completedSets}
        totalSets={totalSets}
        supersetGroupId={supersetGroupId}
        isExpanded={isExpanded}
        onToggleExpanded={handleToggleExpanded}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemoveExercise={onRemoveExercise}
      />

      {isExpanded && (
        <Box p="sm">
          {previousPerformance?.topSet && (
            <Box mb="sm">
              <SimplePreviousPerformance
                lastWeight={previousPerformance.topSet.weight}
                lastReps={previousPerformance.topSet.reps}
                lastRpe={previousPerformance.sets[0]?.rpe}
              />
            </Box>
          )}

          {notes && (
            <Text
              fz="xs"
              c="dimmed"
              px="xs"
              py={4}
              mb="sm"
              style={{ backgroundColor: "var(--mantine-color-default-hover)" }}
            >
              {notes}
            </Text>
          )}

          <SetsList
            sets={sets}
            previousPerformance={previousPerformance}
            weightUnit={weightUnit}
            onUpdateSet={onUpdateSet}
            onDeleteSet={onDeleteSet}
            onCompleteSet={handleCompleteSet}
            onAddSet={onAddSet}
          />

          {showRestTimer && activeRestTimer && (
            <Box
              mt="sm"
              pt="sm"
              style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
            >
              <Flex justify="center">
                <RestTimer
                  defaultSeconds={restTimerSeconds}
                  autoStart
                  onComplete={() => setActiveRestTimer(false)}
                />
              </Flex>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export { ExerciseBlock };
export type { Exercise, ExerciseSet, PreviousPerformance };
