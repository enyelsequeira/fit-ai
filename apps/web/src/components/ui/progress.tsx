import type { ProgressProps as MantineProgressProps, RingProgressProps } from "@mantine/core";

import { Progress as MantineProgress, RingProgress } from "@mantine/core";
import { forwardRef } from "react";

interface ProgressProps extends Omit<MantineProgressProps, "value"> {
  value?: number;
  max?: number;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    return <MantineProgress ref={ref} value={percentage} size="sm" {...props} />;
  },
);

Progress.displayName = "Progress";

interface CircularProgressProps {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function CircularProgress({
  value = 0,
  max = 100,
  size = 40,
  strokeWidth = 4,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <RingProgress
      size={size}
      thickness={strokeWidth}
      sections={[{ value: percentage, color: "blue" }]}
    />
  );
}

export { Progress, CircularProgress };
