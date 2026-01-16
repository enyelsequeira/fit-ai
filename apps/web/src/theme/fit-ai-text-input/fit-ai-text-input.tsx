import { TextInput } from "@mantine/core";

import styles from "./fit-ai-text-input.module.css";

export const FitAiTextInput = TextInput.extend({
  classNames: {
    root: styles.root,
    wrapper: styles.wrapper,
    input: styles.input,
    label: styles.label,
    description: styles.description,
    error: styles.error,
    required: styles.required,
    section: styles.section,
  },
  defaultProps: {
    radius: "md",
    size: "md",
  },
});
