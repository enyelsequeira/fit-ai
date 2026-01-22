import type { SkeletonProps as MantineSkeletonProps } from "@mantine/core";

import { Skeleton as MantineSkeleton } from "@mantine/core";
import { forwardRef } from "react";

type SkeletonProps = MantineSkeletonProps;

/**
 * Skeleton component for loading states.
 * Wraps Mantine's Skeleton with consistent defaults.
 *
 * @example
 * <Skeleton height={40} width={200} />
 * <Skeleton height={100} radius="md" />
 * <Skeleton circle height={48} />
 */
const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>((props, ref) => {
  return <MantineSkeleton ref={ref} radius="sm" {...props} />;
});

Skeleton.displayName = "Skeleton";

export { Skeleton };
