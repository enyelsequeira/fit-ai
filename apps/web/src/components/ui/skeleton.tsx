import type { SkeletonProps as MantineSkeletonProps } from "@mantine/core";

import { Skeleton as MantineSkeleton } from "@mantine/core";
import { forwardRef } from "react";

interface SkeletonProps extends MantineSkeletonProps {
  className?: string;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, style, ...props }, ref) => {
    // Parse common Tailwind-like classes for dimensions
    let width: string | number | undefined;
    let height: string | number | undefined;
    let borderRadius: string | undefined;

    if (className) {
      const widthMatch = className.match(/w-(\d+)/);
      const heightMatch = className.match(/h-(\d+)/);
      const roundedMatch = className.match(/rounded-full/);

      if (widthMatch?.[1]) {
        width = parseInt(widthMatch[1]) * 4; // Convert Tailwind units
      }
      if (heightMatch?.[1]) {
        height = parseInt(heightMatch[1]) * 4;
      }
      if (roundedMatch) {
        borderRadius = "50%";
      }
    }

    return (
      <MantineSkeleton
        ref={ref}
        w={width}
        h={height}
        radius={borderRadius ? "xl" : "sm"}
        style={style}
        {...props}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
