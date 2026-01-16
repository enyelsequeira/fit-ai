import { Select } from "@mantine/core";

import styles from "./fit-ai-select.module.css";

export const FitAiSelect = Select.extend({
  classNames: {
    root: styles.root,
    wrapper: styles.wrapper,
    input: styles.input,
    section: styles.section,
    label: styles.label,
    description: styles.description,
    error: styles.error,
    required: styles.required,
    dropdown: styles.dropdown,
    options: styles.options,
    option: styles.option,
    empty: styles.empty,
    group: styles.group,
    groupLabel: styles.groupLabel,
  },
  defaultProps: {
    radius: "md",
    size: "md",
  },
});
