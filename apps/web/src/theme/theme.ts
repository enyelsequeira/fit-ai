import { createTheme, DEFAULT_THEME } from "@mantine/core";

import { FitAiTextInput } from "@/theme/fit-ai-text-input/fit-ai-text-input.tsx";
import { FitAiTextArea } from "@/theme/fit-ai-text-area/fit-ai-text-area.tsx";
import { FitAiSelect } from "@/theme/fit-ai-select/fit-ai-select.tsx";
import { FitAiNumberInput } from "@/theme/fit-ai-number-input/fit-ai-number-input.tsx";

export const theme = createTheme({
  fontFamily: `'Inter Variable', ${DEFAULT_THEME.fontFamily} `,
  fontFamilyMonospace:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
  headings: {
    fontFamily: `'Inter Variable', ${DEFAULT_THEME.fontFamily}`,
  },
  components: {
    TextInput: FitAiTextInput,
    Textarea: FitAiTextArea,
    Select: FitAiSelect,
    NumberInput: FitAiNumberInput,
  },
});
