import { Textarea } from "@mantine/core";

import styles from "./fit-ai-text-area.module.css";

export const FitAiTextArea = Textarea.extend({
  classNames: {
    root: styles.root,
    wrapper: styles.wrapper,
    input: styles.input,
    label: styles.label,
    description: styles.description,
    error: styles.error,
    required: styles.required,
  },
  defaultProps: {
    radius: "md",
    size: "md",
  },
});
