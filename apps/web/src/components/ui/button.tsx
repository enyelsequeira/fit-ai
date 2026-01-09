import type { ButtonProps as MantineButtonProps } from "@mantine/core";

import { Button as MantineButton } from "@mantine/core";
import { forwardRef } from "react";

export type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
export type ButtonSize =
  | "default"
  | "xs"
  | "sm"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg";

interface ButtonProps extends Omit<MantineButtonProps, "variant" | "size"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantMap: Record<ButtonVariant, MantineButtonProps["variant"]> = {
  default: "filled",
  outline: "outline",
  secondary: "light",
  ghost: "subtle",
  destructive: "filled",
  link: "transparent",
};

const sizeMap: Record<ButtonSize, MantineButtonProps["size"]> = {
  default: "sm",
  xs: "xs",
  sm: "sm",
  lg: "md",
  icon: "sm",
  "icon-xs": "xs",
  "icon-sm": "sm",
  "icon-lg": "md",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", style, ...props }, ref) => {
    const isIcon = size.startsWith("icon");
    const iconSizes: Record<string, string> = {
      icon: "32px",
      "icon-xs": "24px",
      "icon-sm": "28px",
      "icon-lg": "36px",
    };

    return (
      <MantineButton
        ref={ref}
        variant={variantMap[variant]}
        size={sizeMap[size]}
        color={variant === "destructive" ? "red" : undefined}
        style={{
          textDecoration: variant === "link" ? "underline" : undefined,
          ...(isIcon ? { width: iconSizes[size], minWidth: iconSizes[size], padding: 0 } : {}),
          ...style,
        }}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button };
