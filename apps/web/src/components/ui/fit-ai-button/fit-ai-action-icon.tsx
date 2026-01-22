import type { ActionIconProps as MantineActionIconProps } from "@mantine/core";

import { ActionIcon as MantineActionIcon, createPolymorphicComponent } from "@mantine/core";
import { forwardRef } from "react";

import styles from "./fit-ai-action-icon.module.css";

/** Custom variant names for FitAiActionIcon */
export type FitAiActionIconVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";

/** Custom size names for FitAiActionIcon */
export type FitAiActionIconSize = "xs" | "sm" | "md" | "lg" | "xl";

export type FitAiActionIconProps = {
  /** ActionIcon variant style */
  variant?: FitAiActionIconVariant;
  /** ActionIcon size */
  size?: FitAiActionIconSize;
  /** Show loading spinner */
  loading?: boolean;
  /** Disable the action icon */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
} & Omit<MantineActionIconProps, "variant" | "size" | "color">;

const _FitAiActionIcon = forwardRef<HTMLButtonElement, FitAiActionIconProps>(
  ({ variant = "ghost", size = "md", className, loading, disabled, classNames, ...props }, ref) => {
    // Combine root class with any additional className
    const rootClasses = [styles.root, className].filter(Boolean).join(" ");

    return (
      <MantineActionIcon
        ref={ref}
        // Use default variant to get base Mantine structure
        variant="default"
        loading={loading}
        disabled={disabled}
        // Apply data attributes for CSS styling
        data-variant={variant}
        data-size={size}
        data-loading={loading || undefined}
        classNames={{
          ...classNames,
          root: rootClasses,
        }}
        radius="sm"
        {...props}
      />
    );
  },
);

_FitAiActionIcon.displayName = "FitAiActionIcon";

/**
 * FitAiActionIcon - A custom styled icon button for the FitAi application
 *
 * Variants:
 * - `primary` - Primary action with teal background
 * - `secondary` - Light/soft background for secondary actions
 * - `outline` - Outline style with teal colors
 * - `ghost` - Subtle/transparent for tertiary actions (default)
 * - `danger` - Red color for destructive actions
 * - `success` - Green color for success actions
 *
 * Sizes: `xs`, `sm`, `md` (default), `lg`, `xl`
 *
 * Polymorphic - use `component` prop to render as Link, anchor, etc.
 *
 * Important: Always provide aria-label for accessibility
 *
 * @example
 * <FitAiActionIcon aria-label="Settings"><IconSettings /></FitAiActionIcon>
 * <FitAiActionIcon variant="primary" aria-label="Add"><IconPlus /></FitAiActionIcon>
 * <FitAiActionIcon variant="outline" aria-label="Edit"><IconEdit /></FitAiActionIcon>
 * <FitAiActionIcon variant="danger" aria-label="Delete"><IconTrash /></FitAiActionIcon>
 * <FitAiActionIcon variant="success" aria-label="Confirm"><IconCheck /></FitAiActionIcon>
 */
export const FitAiActionIcon = createPolymorphicComponent<"button", FitAiActionIconProps>(
  _FitAiActionIcon,
);
