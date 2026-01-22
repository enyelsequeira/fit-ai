import type { ReactNode } from "react";

import { Box, Group, Tooltip } from "@mantine/core";
import { IconMoodSad, IconRefresh, IconSearch } from "@tabler/icons-react";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import styles from "./fit-ai-entity-list.module.css";

// ============================================
// Sub-component Types (all ≤6 props)
// ============================================

type LoadingProps = {
  /** Controls visibility of loading state */
  visible: boolean;
  /** Skeleton components to render while loading */
  children: ReactNode;
};

type ErrorProps = {
  /** Controls visibility of error state */
  visible: boolean;
  /** Error title */
  title?: string;
  /** Error description message */
  message?: string;
  /** Callback when retry button is clicked */
  onRetry?: () => void;
};

type EmptyProps = {
  /** Controls visibility of empty state */
  visible: boolean;
  /** Icon to display */
  icon: ReactNode;
  /** Empty state title */
  title: string;
  /** Empty state description */
  description: string;
  /** Optional action button/element */
  action?: ReactNode;
};

type SearchEmptyProps = {
  /** Controls visibility of search empty state */
  visible: boolean;
  /** The search query that returned no results */
  searchQuery: string;
};

type GridProps = {
  /** Grid items to render */
  children: ReactNode;
  /** Additional CSS class */
  className?: string;
};

type SummaryProps = {
  /** Controls visibility of summary */
  visible: boolean;
  /** Summary content (e.g., "Showing 12 workouts") */
  children: ReactNode;
};

type ContainerProps = {
  /** Child components (Loading, Error, Empty, Grid, Summary) */
  children: ReactNode;
  /** Additional CSS class */
  className?: string;
};

// ============================================
// Sub-components
// ============================================

/**
 * Loading state - renders children (skeletons) in a grid when visible
 */
function Loading({ visible, children }: LoadingProps) {
  if (!visible) return null;

  return (
    <div className={styles.skeletonGrid} aria-busy="true" aria-label="Loading content">
      {children}
    </div>
  );
}

/**
 * Error state - displays error message with optional retry button
 */
function Error({
  visible,
  title = "Something went wrong",
  message = "We couldn't load your data. This might be a temporary issue. Please try again.",
  onRetry,
}: ErrorProps) {
  if (!visible) return null;

  return (
    <div className={styles.errorState} role="alert">
      <div className={styles.errorStateIcon}>
        <IconMoodSad size={32} stroke={1.5} aria-hidden="true" />
      </div>
      <FitAiText.Subheading className={styles.errorStateTitle}>{title}</FitAiText.Subheading>
      <FitAiText.Muted className={styles.errorStateMessage}>{message}</FitAiText.Muted>
      {onRetry && (
        <Tooltip label="Retry loading data" position="bottom" withArrow>
          <FitAiButton
            variant="outline"
            leftSection={<IconRefresh size={16} aria-hidden="true" />}
            onClick={onRetry}
            mt="lg"
          >
            Try Again
          </FitAiButton>
        </Tooltip>
      )}
    </div>
  );
}

/**
 * Empty state - displays when there are no items (not from search)
 */
function Empty({ visible, icon, title, description, action }: EmptyProps) {
  if (!visible) return null;

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>{icon}</div>
      <FitAiText.Subheading className={styles.emptyStateTitle}>{title}</FitAiText.Subheading>
      <FitAiText.Muted className={styles.emptyStateMessage}>{description}</FitAiText.Muted>
      {action && <Group mt="lg">{action}</Group>}
    </div>
  );
}

/**
 * Search empty state - displays when search returns no results
 */
function SearchEmpty({ visible, searchQuery }: SearchEmptyProps) {
  if (!visible) return null;

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>
        <IconSearch size={32} stroke={1.5} aria-hidden="true" />
      </div>
      <FitAiText.Subheading className={styles.emptyStateTitle}>
        No results found
      </FitAiText.Subheading>
      <FitAiText.Muted className={styles.emptyStateMessage}>
        No items match your search for &ldquo;{searchQuery}&rdquo;. Try adjusting your search terms.
      </FitAiText.Muted>
    </div>
  );
}

/**
 * Grid - renders children in a responsive grid layout
 */
function Grid({ children, className }: GridProps) {
  return <div className={`${styles.grid} ${className ?? ""}`}>{children}</div>;
}

/**
 * Summary - displays results count or custom summary text
 */
function Summary({ visible, children }: SummaryProps) {
  if (!visible) return null;

  return (
    <div className={styles.resultsSummary}>
      <FitAiText.Caption className={styles.resultsCount}>{children}</FitAiText.Caption>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

/**
 * Container component that wraps all entity list content.
 * Uses compound component pattern for flexible composition.
 *
 * @example
 * ```tsx
 * <FitAiEntityList>
 *   <FitAiEntityList.Loading visible={isLoading}>
 *     <WorkoutCardSkeleton />
 *     <WorkoutCardSkeleton />
 *   </FitAiEntityList.Loading>
 *
 *   <FitAiEntityList.Error
 *     visible={isError}
 *     title="Failed to load"
 *     onRetry={refetch}
 *   />
 *
 *   <FitAiEntityList.Empty
 *     visible={items.length === 0 && !searchQuery}
 *     icon={<IconDumbbell />}
 *     title="No workouts yet"
 *     description="Create your first workout"
 *   />
 *
 *   <FitAiEntityList.SearchEmpty
 *     visible={items.length === 0 && !!searchQuery}
 *     searchQuery={searchQuery}
 *   />
 *
 *   <FitAiEntityList.Grid>
 *     {items.map(item => (
 *       <WorkoutCard key={item.id} workout={item} />
 *     ))}
 *   </FitAiEntityList.Grid>
 *
 *   <FitAiEntityList.Summary visible={items.length > 0}>
 *     Showing {items.length} workouts
 *   </FitAiEntityList.Summary>
 * </FitAiEntityList>
 * ```
 */
function FitAiEntityListRoot({ children, className }: ContainerProps) {
  return <Box className={`${styles.container} ${className ?? ""}`}>{children}</Box>;
}

// ============================================
// Compound Component Assembly
// ============================================

export const FitAiEntityList = Object.assign(FitAiEntityListRoot, {
  Loading,
  Error,
  Empty,
  SearchEmpty,
  Grid,
  Summary,
});
