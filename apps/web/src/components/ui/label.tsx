import type { TextProps } from "@mantine/core";

import { Text } from "@mantine/core";
import { forwardRef } from "react";

interface LabelProps extends Omit<TextProps, "component"> {
  htmlFor?: string;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(({ children, ...props }, ref) => {
  return (
    <Text ref={ref} component="label" size="xs" fw={500} {...props}>
      {children}
    </Text>
  );
});

Label.displayName = "Label";

export { Label };
