import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import styles from "./fit-ai-sidebar.module.css";
import { FitAiToolTip } from "@/components/ui/fit-ai-tooltip/fit-ai-tool-tip.tsx";

// =============================================================================
// Context
// =============================================================================

type SidebarContextValue = {
  selectedId: string | number | null;
  onSelect: (id: string | number | null) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("FitAiSidebar compound components must be used within FitAiSidebar");
  }
  return context;
}

// =============================================================================
// Types
// =============================================================================

type SidebarRootProps = {
  selectedId: string | number | null;
  onSelect: (id: string | number | null) => void;
  isLoading?: boolean;
  className?: string;
  children: ReactNode;
};

type SidebarHeaderProps = {
  title: string;
  action?: ReactNode;
};

type SidebarAllItemsProps = {
  label: string;
  subtext?: string;
  count?: number;
  icon?: ReactNode;
};

type SidebarSectionProps = {
  label?: string;
  children: ReactNode;
};

type SidebarItemProps = {
  id: string | number;
  label: string;
  count?: number;
  icon?: ReactNode;
  action?: ReactNode;
};

type SidebarStatsProps = {
  stats: Array<{
    label: string;
    value: number | string;
  }>;
};

type SidebarEmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

type SidebarLoadingProps = {
  title?: string;
};

// =============================================================================
// Sub-components
// =============================================================================

function Header({ title, action }: SidebarHeaderProps) {
  return (
    <div className={styles.header}>
      <FitAiText.Body className={styles.headerTitle}>{title}</FitAiText.Body>
      {action}
    </div>
  );
}

function AllItems({ label, subtext, count, icon }: SidebarAllItemsProps) {
  const { selectedId, onSelect } = useSidebarContext();
  const isSelected = selectedId === null;

  return (
    <div
      className={styles.allItemsItem}
      data-active={isSelected}
      onClick={() => onSelect(null)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(null)}
      role="button"
      tabIndex={0}
    >
      {icon && <div className={styles.allItemsIcon}>{icon}</div>}
      <div className={styles.allItemsContent}>
        <FitAiText.Body className={styles.allItemsLabel}>{label}</FitAiText.Body>
        {subtext && (
          <FitAiText.Caption className={styles.allItemsSubtext}>{subtext}</FitAiText.Caption>
        )}
      </div>
      {count !== undefined && <span className={styles.allItemsCount}>{count}</span>}
    </div>
  );
}

function Section({ label, children }: SidebarSectionProps) {
  return (
    <>
      {label && (
        <>
          <div className={styles.divider} />
          <FitAiText.Label className={styles.sectionLabel}>{label}</FitAiText.Label>
        </>
      )}
      {children}
    </>
  );
}

function Item({ id, label, count, icon, action }: SidebarItemProps) {
  const { selectedId, onSelect } = useSidebarContext();
  const isSelected = selectedId === id;

  return (
    <div
      className={styles.item}
      data-active={isSelected}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(id)}
      role="button"
      tabIndex={0}
    >
      {icon && <div className={styles.itemIcon}>{icon}</div>}
      <div className={styles.itemContent}>
        <FitAiText.Body className={styles.itemLabel}>{label}</FitAiText.Body>
      </div>
      {count !== undefined && <span className={styles.itemCount}>{count}</span>}
      {action && (
        <div className={styles.itemActions}>
          <FitAiToolTip
            toolTipProps={{
              label: "Edit",
            }}
          >
            <div
              role="button"
              tabIndex={0}
              className={styles.actionButton}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.key === "Enter" && e.stopPropagation()}
              aria-label={`Action for ${label}`}
            >
              {action}
            </div>
          </FitAiToolTip>
        </div>
      )}
    </div>
  );
}

function Stats({ stats }: SidebarStatsProps) {
  if (stats.length === 0) return null;

  return (
    <div className={styles.statsSection}>
      {stats.map((stat) => (
        <div key={stat.label} className={styles.statCard}>
          <FitAiText.Heading className={styles.statValue}>{stat.value}</FitAiText.Heading>
          <FitAiText.Caption className={styles.statLabel}>{stat.label}</FitAiText.Caption>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, description, action }: SidebarEmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>{icon}</div>
      <FitAiText.Subheading className={styles.emptyStateTitle}>{title}</FitAiText.Subheading>
      {description && (
        <FitAiText.Muted className={styles.emptyStateText}>{description}</FitAiText.Muted>
      )}
      {action}
    </div>
  );
}

function Loading({ title = "Loading" }: SidebarLoadingProps) {
  return (
    <>
      <div className={styles.header}>
        <FitAiText.Subheading className={styles.headerTitle}>{title}</FitAiText.Subheading>
      </div>
      <div className={styles.navSection}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeletonItem}>
            <div className={`${styles.skeleton} ${styles.skeletonIcon}`} />
            <div className={`${styles.skeleton} ${styles.skeletonText}`} />
          </div>
        ))}
      </div>
    </>
  );
}

// =============================================================================
// Root Component
// =============================================================================

function SidebarRoot({
  selectedId,
  onSelect,
  isLoading = false,
  className,
  children,
}: SidebarRootProps) {
  if (isLoading) {
    return (
      <div className={`${styles.sidebar} ${className ?? ""}`}>
        <Loading />
      </div>
    );
  }

  return (
    <SidebarContext.Provider value={{ selectedId, onSelect }}>
      <div className={`${styles.sidebar} ${className ?? ""}`}>{children}</div>
    </SidebarContext.Provider>
  );
}

// =============================================================================
// Navigation Container (wraps AllItems, Section, Item, EmptyState)
// =============================================================================

function Navigation({ children }: { children: ReactNode }) {
  return <div className={styles.navSection}>{children}</div>;
}

// =============================================================================
// Compound Component Export
// =============================================================================

export const FitAiSidebar = Object.assign(SidebarRoot, {
  Header,
  Navigation,
  AllItems,
  Section,
  Item,
  Stats,
  EmptyState,
  Loading,
});
