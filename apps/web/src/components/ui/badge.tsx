import type { BadgeProps as MantineBadgeProps } from "@mantine/core";

import { Badge as MantineBadge } from "@mantine/core";
import { forwardRef } from "react";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "destructive"
  | "outline";

interface BadgeProps extends Omit<MantineBadgeProps, "variant"> {
  variant?: BadgeVariant;
}

const variantMap: Record<BadgeVariant, { variant: MantineBadgeProps["variant"]; color?: string }> =
  {
    default: { variant: "filled" },
    secondary: { variant: "light" },
    success: { variant: "light", color: "green" },
    warning: { variant: "light", color: "yellow" },
    destructive: { variant: "light", color: "red" },
    outline: { variant: "outline" },
  };

const Badge = forwardRef<HTMLDivElement, BadgeProps>(({ variant = "default", ...props }, ref) => {
  const { variant: mantineVariant, color } = variantMap[variant];
  return <MantineBadge ref={ref} variant={mantineVariant} color={color} size="sm" {...props} />;
});

Badge.displayName = "Badge";

export { Badge };
