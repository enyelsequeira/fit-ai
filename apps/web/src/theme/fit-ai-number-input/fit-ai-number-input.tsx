import { NumberInput } from "@mantine/core";

import styles from "./fit-ai-number-input.module.css";

export const FitAiNumberInput = NumberInput.extend({
  classNames: {
    root: styles.root,
    wrapper: styles.wrapper,
    input: styles.input,
    section: styles.section,
    label: styles.label,
    description: styles.description,
    error: styles.error,
    required: styles.required,
    controls: styles.controls,
    control: styles.control,
  },
  defaultProps: {
    radius: "md",
    size: "md",
    hideControls: true,
  },
});
