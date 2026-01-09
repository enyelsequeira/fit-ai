import type { TextInputProps } from "@mantine/core";

import { TextInput } from "@mantine/core";
import { forwardRef } from "react";

interface InputProps extends Omit<TextInputProps, "size"> {
  size?: "default" | "sm" | "lg";
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ size = "default", ...props }, ref) => {
  const sizeMap = {
    default: "sm" as const,
    sm: "xs" as const,
    lg: "md" as const,
  };

  return <TextInput ref={ref} size={sizeMap[size]} {...props} />;
});

Input.displayName = "Input";

export { Input };
