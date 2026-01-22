import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import { Box, Skeleton as MantineSkeleton } from "@mantine/core";

import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import styles from "./fit-ai-stats-row.module.css";

/**
 * Color variants for stat icon
 */
export type StatIconColor =
  | "blue"
  | "gray"
  | "teal"
  | "orange"
  | "green"
  | "red"
  | "cyan"
  | "yellow";

// ============================================================================
// Context
// ============================================================================

type StatsRowContextValue = {
  columns: 2 | 3 | 4;
};

const StatsRowContext = createContext<StatsRowContextValue | null>(null);

function useStatsRowContext() {
  const context = useContext(StatsRowContext);
  if (!context) {
    throw new Error("FitAiStatsRow compound components must be used within FitAiStatsRow");
  }
  return context;
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Props for the StatIcon sub-component
 */
type StatIconProps = {
  children: ReactNode;
};

/**
 * Icon container for a stat item
 */
function StatIcon({ children }: StatIconProps) {
  return <>{children}</>;
}

/**
 * Props for the StatValue sub-component
 */
type StatValueProps = {
  children: ReactNode;
};

/**
 * Value display for a stat item
 */
function StatValue({ children }: StatValueProps) {
  return <FitAiText.Heading className={styles.statValue}>{children}</FitAiText.Heading>;
}

/**
 * Props for the StatLabel sub-component
 */
type StatLabelProps = {
  children: ReactNode;
};

/**
 * Label display for a stat item
 */
function StatLabel({ children }: StatLabelProps) {
  return <FitAiText.Caption className={styles.statLabel}>{children}</FitAiText.Caption>;
}

/**
 * Props for the Stat sub-component
 */
type StatProps = {
  children: ReactNode;
  /** Color variant for the icon background */
  color?: StatIconColor;
  /** Optional tooltip text */
};

/**
 * Individual stat card container
 */
function Stat({ children, color = "gray" }: StatProps) {
  // Extract icon, value, and label from children
  let iconContent: ReactNode = null;
  let valueContent: ReactNode = null;
  let labelContent: ReactNode = null;
  const otherContent: ReactNode[] = [];

  const childArray = Array.isArray(children) ? children : [children];

  for (const child of childArray) {
    if (!child || typeof child !== "object" || !("type" in child)) {
      otherContent.push(child);
      continue;
    }

    if (child.type === StatIcon) {
      iconContent = child.props.children;
    } else if (child.type === StatValue) {
      valueContent = child;
    } else if (child.type === StatLabel) {
      labelContent = child;
    } else {
      otherContent.push(child);
    }
  }

  return (
    <Box className={styles.statCard}>
      {iconContent && (
        <div className={styles.statIcon} data-color={color}>
          {iconContent}
        </div>
      )}
      <div className={styles.statContent}>
        {valueContent}
        {labelContent}
        {otherContent}
      </div>
    </Box>
  );
}

/**
 * Props for the Skeleton sub-component
 */
type SkeletonProps = {
  /** Whether the skeleton is visible */
  visible?: boolean;
  /** Number of skeleton items to show (defaults to columns from context) */
  count?: number;
};

/**
 * Loading skeleton for stats row
 */
function StatsSkeleton({ visible = true, count }: SkeletonProps) {
  const { columns } = useStatsRowContext();
  const skeletonCount = count ?? columns;

  if (!visible) {
    return null;
  }

  return (
    <>
      {Array.from({ length: skeletonCount }).map((_, i) => (
        <MantineSkeleton key={i} height={64} radius="md" className={styles.statCard} />
      ))}
    </>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Props for the FitAiStatsRow component
 */
type FitAiStatsRowProps = {
  children: ReactNode;
  /** Number of columns (2, 3, or 4) - defaults to 4 */
  columns?: 2 | 3 | 4;
  /** Additional CSS class */
  className?: string;
};

/**
 * Generic stats row component displaying metrics in a responsive grid.
 * Uses compound component pattern for flexible composition.
 *
 * @example
 * ```tsx
 * <FitAiStatsRow columns={4}>
 *   <FitAiStatsRow.Stat color="blue">
 *     <FitAiStatsRow.StatIcon><IconDumbbell /></FitAiStatsRow.StatIcon>
 *     <FitAiStatsRow.StatValue>42</FitAiStatsRow.StatValue>
 *     <FitAiStatsRow.StatLabel>Total Workouts</FitAiStatsRow.StatLabel>
 *   </FitAiStatsRow.Stat>
 *
 *   <FitAiStatsRow.Stat color="green" tooltip="Estimated from exercises">
 *     <FitAiStatsRow.StatIcon><IconFlame /></FitAiStatsRow.StatIcon>
 *     <FitAiStatsRow.StatValue>12,450</FitAiStatsRow.StatValue>
 *     <FitAiStatsRow.StatLabel>Calories Burned</FitAiStatsRow.StatLabel>
 *   </FitAiStatsRow.Stat>
 *
 *   <FitAiStatsRow.Skeleton visible={isLoading} />
 * </FitAiStatsRow>
 * ```
 */
function FitAiStatsRowRoot({ children, columns = 4, className }: FitAiStatsRowProps) {
  return (
    <StatsRowContext.Provider value={{ columns }}>
      <div className={`${styles.statsRow} ${className ?? ""}`} data-columns={columns}>
        {children}
      </div>
    </StatsRowContext.Provider>
  );
}

// ============================================================================
// Compound Component Assembly
// ============================================================================

export const FitAiStatsRow = Object.assign(FitAiStatsRowRoot, {
  Stat,
  StatIcon,
  StatValue,
  StatLabel,
  Skeleton: StatsSkeleton,
});
