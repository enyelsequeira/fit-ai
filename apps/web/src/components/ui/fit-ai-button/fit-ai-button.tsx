import type { ButtonProps as MantineButtonProps } from "@mantine/core";

import { Button as MantineButton, createPolymorphicComponent } from "@mantine/core";
import { forwardRef } from "react";

import styles from "./fit-ai-button.module.css";

/** Custom variant names for FitAiButton */
export type FitAiButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive"
  | "link";

/** Custom size names for FitAiButton */
export type FitAiButtonSize =
  | "xs"
  | "sm"
  | "md"
  | "default"
  | "lg"
  | "xl"
  | "icon-xs"
  | "icon-sm"
  | "icon"
  | "icon-lg";

export interface FitAiButtonProps extends Omit<MantineButtonProps, "variant" | "size" | "color"> {
  /** Button variant style */
  variant?: FitAiButtonVariant;
  /** Button size */
  size?: FitAiButtonSize;
  /** Use outline style for destructive variant */
  destructiveOutline?: boolean;
}

/** Normalize size value - "default" maps to "md" */
function normalizeSize(size: FitAiButtonSize): string {
  return size === "default" ? "md" : size;
}

const _FitAiButton = forwardRef<HTMLButtonElement, FitAiButtonProps>(
  (
    {
      variant = "default",
      size = "md",
      destructiveOutline,
      className,
      loading,
      fullWidth,
      classNames,
      ...props
    },
    ref,
  ) => {
    // Determine the actual variant for data attribute
    const dataVariant =
      variant === "destructive" && destructiveOutline ? "destructive-outline" : variant;

    // Normalize size
    const dataSize = normalizeSize(size);

    // Combine root class with any additional className
    const rootClasses = [styles.root, className].filter(Boolean).join(" ");

    return (
      <MantineButton
        ref={ref}
        // Use default variant to get base Mantine structure
        variant="default"
        loading={loading}
        fullWidth={fullWidth}
        // Apply data attributes for CSS styling
        data-variant={dataVariant}
        data-size={dataSize}
        data-loading={loading || undefined}
        data-full-width={fullWidth || undefined}
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

_FitAiButton.displayName = "FitAiButton";

/**
 * FitAiButton - A custom styled button for the FitAi application
 *
 * Variants:
 * - `default` - Primary action button with gradient background
 * - `outline` - Secondary outline style with brand colors
 * - `secondary` - Light/soft background for secondary actions
 * - `ghost` - Subtle/transparent for tertiary actions
 * - `destructive` - Red/danger color for destructive actions
 * - `link` - Text link style with underline on hover
 *
 * Sizes:
 * - Text buttons: `xs`, `sm`, `md` / `default`, `lg`, `xl`
 * - Icon-only buttons: `icon-xs`, `icon-sm`, `icon`, `icon-lg`
 *
 * Additional props:
 * - `destructiveOutline` - Use outline style for destructive variant
 *
 * Polymorphic - use `component` prop to render as Link, anchor, etc.
 *
 * @example
 * <FitAiButton>Primary Action</FitAiButton>
 * <FitAiButton variant="outline">Secondary</FitAiButton>
 * <FitAiButton variant="ghost">Subtle</FitAiButton>
 * <FitAiButton variant="destructive">Delete</FitAiButton>
 * <FitAiButton variant="destructive" destructiveOutline>Cancel</FitAiButton>
 * <FitAiButton variant="link">Learn more</FitAiButton>
 * <FitAiButton size="icon-sm"><IconSettings /></FitAiButton>
 * <FitAiButton component={Link} to="/path">Link Button</FitAiButton>
 */
export const FitAiButton = createPolymorphicComponent<"button", FitAiButtonProps>(_FitAiButton);
