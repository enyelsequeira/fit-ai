import type { ButtonProps as MantineButtonProps } from "@mantine/core";

import { Button as MantineButton, createPolymorphicComponent } from "@mantine/core";
import { forwardRef } from "react";

import styles from "./fit-ai-button.module.css";

/** Custom variant names for FitAiButton */
export type FitAiButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";

/** Custom size names for FitAiButton */
export type FitAiButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export type FitAiButtonProps = {
  /** Button variant style */
  variant?: FitAiButtonVariant;
  /** Button size */
  size?: FitAiButtonSize;
  /** Show loading spinner */
  loading?: boolean;
  /** Disable the button */
  disabled?: boolean;
  /** Make button full width */
  fullWidth?: boolean;
  /** Additional CSS class */
  className?: string;
} & Omit<MantineButtonProps, "variant" | "size" | "color">;

const _FitAiButton = forwardRef<HTMLButtonElement, FitAiButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      loading,
      disabled,
      fullWidth,
      classNames,
      ...props
    },
    ref,
  ) => {
    // Combine root class with any additional className
    const rootClasses = [styles.root, className].filter(Boolean).join(" ");

    return (
      <MantineButton
        ref={ref}
        // Use default variant to get base Mantine structure
        variant="default"
        loading={loading}
        disabled={disabled}
        fullWidth={fullWidth}
        // Apply data attributes for CSS styling
        data-variant={variant}
        data-size={size}
        data-loading={loading || undefined}
        data-full-width={fullWidth || undefined}
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

_FitAiButton.displayName = "FitAiButton";

/**
 * FitAiButton - A custom styled button for the FitAi application
 *
 * Variants:
 * - `primary` - Primary action button with teal background
 * - `secondary` - Light/soft background for secondary actions
 * - `outline` - Outline style with brand colors
 * - `ghost` - Subtle/transparent for tertiary actions
 * - `danger` - Red color for destructive actions
 * - `success` - Green color for success/confirmation actions
 *
 * Sizes:
 * - `xs` - Extra small
 * - `sm` - Small
 * - `md` - Medium (default)
 * - `lg` - Large
 * - `xl` - Extra large
 *
 * Polymorphic - use `component` prop to render as Link, anchor, etc.
 *
 * @example
 * <FitAiButton>Primary Action</FitAiButton>
 * <FitAiButton variant="secondary">Secondary</FitAiButton>
 * <FitAiButton variant="outline">Outline</FitAiButton>
 * <FitAiButton variant="ghost">Subtle</FitAiButton>
 * <FitAiButton variant="danger">Delete</FitAiButton>
 * <FitAiButton variant="success">Confirm</FitAiButton>
 * <FitAiButton component={Link} to="/path">Link Button</FitAiButton>
 */
export const FitAiButton = createPolymorphicComponent<"button", FitAiButtonProps>(_FitAiButton);
