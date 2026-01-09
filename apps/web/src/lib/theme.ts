import { createTheme, DEFAULT_THEME } from "@mantine/core";

export const theme = createTheme({
  fontFamily: `'Inter Variable', ${DEFAULT_THEME.fontFamily} `,
  fontFamilyMonospace:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
  headings: {
    fontFamily: `'Inter Variable', ${DEFAULT_THEME.fontFamily}`,
  },
});
