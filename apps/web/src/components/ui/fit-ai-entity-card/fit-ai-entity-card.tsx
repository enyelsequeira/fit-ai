import type { KeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { createContext } from "react";

import { Box, Tooltip } from "@mantine/core";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import styles from "./fit-ai-entity-card.module.css";

// ============================================
// Types
// ============================================

/**
 * Accent color options for the card
 */
export type EntityCardAccentColor = "blue" | "green" | "orange" | "red" | "teal" | "yellow";

/**
 * Badge variant options
 */
export type EntityCardBadgeVariant =
  | "default"
  | "active"
  | "public"
  | "private"
  | "folder"
  | "usage"
  | "success"
  | "warning"
  | "info";

/**
 * Action button variant options
 */
export type EntityCardActionVariant = "primary" | "secondary" | "danger" | "active";

// ============================================
// Context
// ============================================

type EntityCardContextValue = {
  accentColor?: EntityCardAccentColor;
  isHighlighted: boolean;
};

const EntityCardContext = createContext<EntityCardContextValue | null>(null);

// ============================================
// Root Component
// ============================================

type FitAiEntityCardProps = {
  /** Accent bar color (displayed at top) */
  accentColor?: EntityCardAccentColor;
  /** Whether the card is highlighted/active */
  isHighlighted?: boolean;
  /** Animation delay for staggered entrance (ms) */
  animationDelay?: number;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Card contents (compound components) */
  children: ReactNode;
};

function FitAiEntityCardRoot({
  accentColor,
  isHighlighted = false,
  animationDelay = 0,
  onClick,
  className,
  children,
}: FitAiEntityCardProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <EntityCardContext.Provider value={{ accentColor, isHighlighted }}>
      <Box
        component="article"
        className={`${styles.card} ${className ?? ""}`}
        style={{ animationDelay: `${animationDelay}ms` }}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        mod={{ accent: accentColor, highlighted: isHighlighted }}
        role="button"
        tabIndex={0}
      >
        {/* Subtle glow effect */}
        <div className={styles.cardGlow} aria-hidden="true" />
        {children}
      </Box>
    </EntityCardContext.Provider>
  );
}

// ============================================
// Header Compound Components
// ============================================

type HeaderProps = {
  children: ReactNode;
  /** Icon displayed in header */
  icon?: ReactNode;
};

function Header({ children, icon }: HeaderProps) {
  return (
    <div className={styles.cardHeader}>
      {icon && <div className={styles.iconWrapper}>{icon}</div>}
      <div className={styles.headerContent}>{children}</div>
    </div>
  );
}

type TitleProps = {
  children: ReactNode;
};

function Title({ children }: TitleProps) {
  const title = typeof children === "string" ? children : undefined;
  return (
    <h3 className={styles.title} title={title}>
      {children}
    </h3>
  );
}

type DescriptionProps = {
  children: ReactNode;
};

function Description({ children }: DescriptionProps) {
  const description = typeof children === "string" ? children : undefined;
  return (
    <FitAiText.Caption className={styles.description} title={description}>
      {children}
    </FitAiText.Caption>
  );
}

// ============================================
// Badge Component
// ============================================

type BadgeProps = {
  /** Icon displayed before text */
  icon?: ReactNode;
  /** Badge content */
  children: ReactNode;
  /** Visual variant */
  variant?: EntityCardBadgeVariant;
  /** Tooltip text on hover */
  tooltip?: string;
};

function Badge({ icon, children, variant = "default", tooltip }: BadgeProps) {
  const variantClass = styles[`${variant}Badge`] ?? "";
  const badge = (
    <span className={`${styles.metaPill} ${variantClass}`}>
      {icon && <span className={styles.metaPillIcon}>{icon}</span>}
      {children}
    </span>
  );

  if (tooltip) {
    return (
      <Tooltip label={tooltip} position="top" withArrow>
        {badge}
      </Tooltip>
    );
  }

  return badge;
}

// ============================================
// Stats Compound Components
// ============================================

type StatsProps = {
  children: ReactNode;
};

function Stats({ children }: StatsProps) {
  return <div className={styles.statsRow}>{children}</div>;
}

type StatProps = {
  /** Icon displayed before value */
  icon?: ReactNode;
  /** Stat value */
  value: string | number;
  /** Optional label after value */
  label?: string;
};

function Stat({ icon, value, label }: StatProps) {
  return (
    <div className={styles.statItem}>
      {icon && <span className={styles.statIcon}>{icon}</span>}
      <FitAiText.Label className={styles.statValue}>{value}</FitAiText.Label>
      {label && <FitAiText.Muted className={styles.statLabel}>{label}</FitAiText.Muted>}
    </div>
  );
}

// ============================================
// Meta Section
// ============================================

type MetaProps = {
  children: ReactNode;
};

function Meta({ children }: MetaProps) {
  return <div className={styles.metaSection}>{children}</div>;
}

// ============================================
// Footer Compound Components
// ============================================

type FooterProps = {
  children: ReactNode;
};

function Footer({ children }: FooterProps) {
  return <div className={styles.actionsBar}>{children}</div>;
}

type ActionsProps = {
  children: ReactNode;
  /** Alignment of actions */
  align?: "left" | "right";
};

function Actions({ children, align = "right" }: ActionsProps) {
  const className = align === "left" ? styles.actionsLeft : styles.actionsRight;
  return <div className={className}>{children}</div>;
}

type ActionProps = {
  /** Icon for the action button */
  icon?: ReactNode;
  /** Button label (hidden if iconOnly) */
  label?: string;
  /** Click handler */
  onClick: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  /** Visual variant */
  variant?: EntityCardActionVariant;
  /** Show only icon (no text) */
  iconOnly?: boolean;
  /** Disabled state */
  disabled?: boolean;
};

/**
 * Maps EntityCard action variants to FitAiButton variants
 */
function mapActionVariantToButtonVariant(
  variant: EntityCardActionVariant,
): "primary" | "secondary" | "danger" | "ghost" {
  switch (variant) {
    case "primary":
      return "primary";
    case "danger":
      return "danger";
    case "active":
      return "secondary";
    case "secondary":
    default:
      return "ghost";
  }
}

function Action({
  icon,
  label,
  onClick,
  variant = "secondary",
  iconOnly = false,
  disabled = false,
}: ActionProps) {
  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClick(e);
  };

  const buttonVariant = mapActionVariantToButtonVariant(variant);

  return (
    <Tooltip label={label} position="top" withArrow disabled={!iconOnly || !label}>
      <FitAiButton
        variant={buttonVariant}
        size="xs"
        onClick={handleClick}
        disabled={disabled}
        aria-label={iconOnly ? label : undefined}
        leftSection={icon}
        className={styles.actionButton}
      >
        {!iconOnly && label}
      </FitAiButton>
    </Tooltip>
  );
}

// ============================================
// Skeleton Component
// ============================================

type SkeletonProps = {
  /** Animation delay for staggered entrance (ms) */
  animationDelay?: number;
};

function Skeleton({ animationDelay = 0 }: SkeletonProps) {
  return (
    <div
      className={styles.skeletonCard}
      style={{ animationDelay: `${animationDelay}ms` }}
      aria-hidden="true"
    >
      <div className={styles.skeletonHeader}>
        <div className={`${styles.skeleton} ${styles.skeletonIcon}`} />
        <div className={styles.skeletonContent}>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
          <div className={`${styles.skeleton} ${styles.skeletonDesc}`} />
        </div>
      </div>
      <div className={styles.skeletonMeta}>
        <div className={`${styles.skeleton} ${styles.skeletonPill}`} />
        <div className={`${styles.skeleton} ${styles.skeletonPill}`} />
        <div className={`${styles.skeleton} ${styles.skeletonPill}`} />
      </div>
      <div className={styles.skeletonStats}>
        <div className={`${styles.skeleton} ${styles.skeletonStat}`} />
        <div className={`${styles.skeleton} ${styles.skeletonStat}`} />
      </div>
    </div>
  );
}

// ============================================
// Compound Component Assembly
// ============================================

/**
 * FitAiEntityCard - A compound component for displaying entities.
 *
 * @example
 * ```tsx
 * <FitAiEntityCard accentColor="blue" isHighlighted={isActive} onClick={handleClick}>
 *   <FitAiEntityCard.Header icon={<IconDumbbell size={20} />}>
 *     <FitAiEntityCard.Title>Morning Workout</FitAiEntityCard.Title>
 *     <FitAiEntityCard.Description>Full body strength training</FitAiEntityCard.Description>
 *   </FitAiEntityCard.Header>
 *
 *   <FitAiEntityCard.Meta>
 *     <FitAiEntityCard.Badge variant="active" icon={<IconStar size={12} />}>Active</FitAiEntityCard.Badge>
 *     <FitAiEntityCard.Badge variant="public">Public</FitAiEntityCard.Badge>
 *   </FitAiEntityCard.Meta>
 *
 *   <FitAiEntityCard.Stats>
 *     <FitAiEntityCard.Stat icon={<IconClock size={14} />} value="45" label="min" />
 *     <FitAiEntityCard.Stat icon={<IconFlame size={14} />} value="320" label="cal" />
 *   </FitAiEntityCard.Stats>
 *
 *   <FitAiEntityCard.Footer>
 *     <FitAiEntityCard.Actions align="left">
 *       <FitAiEntityCard.Action icon={<IconPlayerPlay size={14} />} label="Start" variant="primary" onClick={handleStart} />
 *     </FitAiEntityCard.Actions>
 *     <FitAiEntityCard.Actions align="right">
 *       <FitAiEntityCard.Action icon={<IconEdit size={14} />} label="Edit" onClick={handleEdit} iconOnly />
 *       <FitAiEntityCard.Action icon={<IconTrash size={14} />} label="Delete" variant="danger" onClick={handleDelete} iconOnly />
 *     </FitAiEntityCard.Actions>
 *   </FitAiEntityCard.Footer>
 * </FitAiEntityCard>
 * ```
 */
export const FitAiEntityCard = Object.assign(FitAiEntityCardRoot, {
  Header,
  Title,
  Description,
  Badge,
  Meta,
  Stats,
  Stat,
  Footer,
  Actions,
  Action,
  Skeleton,
});
