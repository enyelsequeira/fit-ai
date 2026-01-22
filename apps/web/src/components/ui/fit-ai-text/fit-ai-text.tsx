import type { TextProps } from "@mantine/core";
import type { HTMLAttributes, ReactNode } from "react";

import { Text } from "@mantine/core";

import styles from "./fit-ai-text.module.css";

// =============================================================================
// Types
// =============================================================================

type FitAiTextVariant = "heading" | "subheading" | "body" | "caption" | "label" | "muted";

type FitAiTextProps = {
  variant?: FitAiTextVariant;
  children: ReactNode;
  className?: string;
  truncate?: boolean;
  lineClamp?: number;
  /** Native HTML title attribute for tooltip on hover */
  title?: string;
} & Omit<TextProps, "size" | "fw" | "c"> &
  Pick<HTMLAttributes<HTMLElement>, "title">;

// =============================================================================
// Base Component
// =============================================================================

function FitAiTextBase({
  variant = "body",
  children,
  className,
  truncate,
  lineClamp,
  ...props
}: FitAiTextProps) {
  const rootClasses = [styles.root, className].filter(Boolean).join(" ");

  return (
    <Text
      data-variant={variant}
      data-truncate={truncate || undefined}
      className={rootClasses}
      lineClamp={lineClamp}
      {...props}
    >
      {children}
    </Text>
  );
}

// =============================================================================
// Sub-components (Variant Shortcuts)
// =============================================================================

function Heading(props: Omit<FitAiTextProps, "variant">) {
  return <FitAiTextBase variant="heading" {...props} />;
}

function Subheading(props: Omit<FitAiTextProps, "variant">) {
  return <FitAiTextBase variant="subheading" {...props} />;
}

function Body(props: Omit<FitAiTextProps, "variant">) {
  return <FitAiTextBase variant="body" {...props} />;
}

function Caption(props: Omit<FitAiTextProps, "variant">) {
  return <FitAiTextBase variant="caption" {...props} />;
}

function Label(props: Omit<FitAiTextProps, "variant">) {
  return <FitAiTextBase variant="label" {...props} />;
}

function Muted(props: Omit<FitAiTextProps, "variant">) {
  return <FitAiTextBase variant="muted" {...props} />;
}

// =============================================================================
// Compound Component Export
// =============================================================================

/**
 * FitAiText - A custom styled text component for the FitAi application
 *
 * Variants:
 * - `heading` - XL size, 700 weight, normal color
 * - `subheading` - LG size, 600 weight, normal color
 * - `body` - MD size, 400 weight, normal color
 * - `caption` - XS size, 400 weight, dimmed color
 * - `label` - SM size, 500 weight, normal color
 * - `muted` - SM size, 400 weight, dimmed color
 *
 * @example
 * // Using variant prop
 * <FitAiText variant="heading">Title</FitAiText>
 *
 * // Using compound components
 * <FitAiText.Heading>Title</FitAiText.Heading>
 * <FitAiText.Subheading>Section</FitAiText.Subheading>
 * <FitAiText.Body>Content</FitAiText.Body>
 * <FitAiText.Caption>Small text</FitAiText.Caption>
 * <FitAiText.Label>Field label</FitAiText.Label>
 * <FitAiText.Muted>Helper text</FitAiText.Muted>
 *
 * // With additional props
 * <FitAiText.Body truncate>Long text that will be truncated...</FitAiText.Body>
 * <FitAiText.Body lineClamp={2}>Multi-line text with clamping</FitAiText.Body>
 */
export const FitAiText = Object.assign(FitAiTextBase, {
  Heading,
  Subheading,
  Body,
  Caption,
  Label,
  Muted,
});
