import type { TextareaProps as MantineTextareaProps } from "@mantine/core";

import { Textarea as MantineTextarea } from "@mantine/core";
import { forwardRef } from "react";

interface TextareaProps extends MantineTextareaProps {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  return <MantineTextarea ref={ref} size="sm" autosize minRows={3} {...props} />;
});

Textarea.displayName = "Textarea";

export { Textarea };
