import { Box, Group } from "@mantine/core";

import classes from "./exercise-dots-indicator.module.css";

interface ExerciseDotsIndicatorProps {
  total: number;
  current: number;
  completedIndexes: number[];
  onDotClick: (index: number) => void;
}

export function ExerciseDotsIndicator({
  total,
  current,
  completedIndexes,
  onDotClick,
}: ExerciseDotsIndicatorProps) {
  const completedSet = new Set(completedIndexes);

  const getDotClassName = (index: number) => {
    if (index === current) {
      return `${classes.dot} ${classes.dotCurrent}`;
    }
    if (completedSet.has(index)) {
      return `${classes.dot} ${classes.dotCompleted}`;
    }
    return `${classes.dot} ${classes.dotIncomplete}`;
  };

  return (
    <Box className={classes.container}>
      <Group gap={0} justify="center" wrap="nowrap">
        {Array.from({ length: total }, (_, index) => (
          <Box
            key={index}
            className={classes.dotWrapper}
            onClick={() => onDotClick(index)}
            role="button"
            tabIndex={0}
            aria-label={`Go to exercise ${index + 1}${index === current ? " (current)" : ""}${completedSet.has(index) ? " (completed)" : ""}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onDotClick(index);
              }
            }}
          >
            <Box className={getDotClassName(index)} />
          </Box>
        ))}
      </Group>
    </Box>
  );
}
