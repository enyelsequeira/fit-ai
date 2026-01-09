import { ActionIcon, Box, TextInput } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";

interface ExerciseSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ExerciseSearch({
  value,
  onChange,
  placeholder = "Search exercises...",
}: ExerciseSearchProps) {
  return (
    <Box pos="relative">
      <TextInput
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        leftSection={<IconSearch size={16} />}
        rightSection={
          value ? (
            <ActionIcon
              variant="subtle"
              size="xs"
              onClick={() => onChange("")}
              aria-label="Clear search"
            >
              <IconX size={12} />
            </ActionIcon>
          ) : null
        }
      />
    </Box>
  );
}
