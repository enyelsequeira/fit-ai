import type { ActionIconProps as MantineActionIconProps } from "@mantine/core";

import { ActionIcon as MantineActionIcon, createPolymorphicComponent } from "@mantine/core";
import { forwardRef } from "react";

import styles from "./fit-ai-action-icon.module.css";

/** Custom variant names for FitAiActionIcon */
export type FitAiActionIconVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive"
  | "link";

/** Custom size names for FitAiActionIcon */
export type FitAiActionIconSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface FitAiActionIconProps extends Omit<
  MantineActionIconProps,
  "variant" | "size" | "color"
> {
  /** ActionIcon variant style */
  variant?: FitAiActionIconVariant;
  /** ActionIcon size */
  size?: FitAiActionIconSize;
}

const _FitAiActionIcon = forwardRef<HTMLButtonElement, FitAiActionIconProps>(
  ({ variant = "ghost", size = "md", className, loading, classNames, ...props }, ref) => {
    // Combine root class with any additional className
    const rootClasses = [styles.root, className].filter(Boolean).join(" ");

    return (
      <MantineActionIcon
        ref={ref}
        variant={variant}
        loading={loading}
        size={size}
        classNames={{
          ...classNames,
          root: rootClasses,
        }}
        radius={"sm"}
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
 * - `default` - Primary action button with gradient background
 * - `outline` - Secondary outline style with brand colors
 * - `secondary` - Light/soft background for secondary actions
 * - `ghost` - Subtle/transparent for tertiary actions (default for action icons)
 * - `destructive` - Red/danger color for destructive actions
 * - `link` - Transparent with brand color
 *
 * Sizes: `xs`, `sm`, `md` (default), `lg`, `xl`
 *
 * Additional props:
 * - `destructiveOutline` - Use outline style for destructive variant
 *
 * Polymorphic - use `component` prop to render as Link, anchor, etc.
 *
 * Important: Always provide aria-label for accessibility
 *
 * @example
 * <FitAiActionIcon aria-label="Settings"><IconSettings /></FitAiActionIcon>
 * <FitAiActionIcon variant="default" aria-label="Add"><IconPlus /></FitAiActionIcon>
 * <FitAiActionIcon variant="outline" aria-label="Edit"><IconEdit /></FitAiActionIcon>
 * <FitAiActionIcon variant="destructive" aria-label="Delete"><IconTrash /></FitAiActionIcon>
 * <FitAiActionIcon variant="destructive" destructiveOutline aria-label="Remove"><IconX /></FitAiActionIcon>
 */
export const FitAiActionIcon = createPolymorphicComponent<"button", FitAiActionIconProps>(
  _FitAiActionIcon,
);
