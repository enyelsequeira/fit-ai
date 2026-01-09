import type { CheckboxProps as MantineCheckboxProps } from "@mantine/core";

import { Checkbox as MantineCheckbox } from "@mantine/core";
import { forwardRef } from "react";

interface CheckboxProps extends MantineCheckboxProps {}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  return <MantineCheckbox ref={ref} size="sm" {...props} />;
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
