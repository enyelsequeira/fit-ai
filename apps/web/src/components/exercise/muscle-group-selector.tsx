import { Badge, Box, Group, TextInput, UnstyledButton } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useState } from "react";

export const muscleGroups = [
  // Chest
  "pectorals",
  // Shoulders
  "anterior deltoids",
  "lateral deltoids",
  "posterior deltoids",
  // Back
  "trapezius",
  "latissimus dorsi",
  "rhomboids",
  "erector spinae",
  // Arms
  "biceps",
  "triceps",
  "forearms",
  // Legs
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "hip flexors",
  // Core
  "rectus abdominis",
  "obliques",
  "transverse abdominis",
] as const;

export type MuscleGroup = (typeof muscleGroups)[number];

interface MuscleGroupSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MuscleGroupSelector({
  value,
  onChange,
  placeholder = "Search muscle groups...",
  disabled = false,
}: MuscleGroupSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredGroups = muscleGroups.filter(
    (group) => group.toLowerCase().includes(search.toLowerCase()) && !value.includes(group),
  );

  const handleSelect = (group: string) => {
    onChange([...value, group]);
    setSearch("");
  };

  const handleRemove = (group: string) => {
    onChange(value.filter((v) => v !== group));
  };

  return (
    <Box pos="relative">
      <Box
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 4,
          minHeight: 32,
          width: "100%",
          padding: "4px 8px",
          border: "1px solid var(--mantine-color-default-border)",
          borderRadius: 0,
          backgroundColor: "transparent",
          fontSize: "var(--mantine-font-size-xs)",
          transition: "border-color 100ms ease, box-shadow 100ms ease",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : undefined,
        }}
      >
        {value.map((group) => (
          <Badge
            key={group}
            size="xs"
            variant="default"
            px={6}
            py={0}
            style={{ fontSize: 10 }}
            rightSection={
              !disabled && (
                <UnstyledButton
                  onClick={() => handleRemove(group)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 2,
                  }}
                >
                  <IconX size={12} />
                </UnstyledButton>
              )
            }
          >
            {group}
          </Badge>
        ))}
        <TextInput
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
          size="xs"
          variant="unstyled"
          styles={{
            input: {
              height: 24,
              minWidth: 80,
              flex: 1,
              padding: 0,
            },
          }}
        />
      </Box>

      {isOpen && filteredGroups.length > 0 && (
        <Box
          pos="absolute"
          top="100%"
          left={0}
          w="100%"
          mt={4}
          style={{
            zIndex: 50,
            maxHeight: 240,
            overflow: "auto",
            borderRadius: 0,
            boxShadow: "var(--mantine-shadow-md)",
            border: "1px solid var(--mantine-color-default-border)",
            backgroundColor: "var(--mantine-color-body)",
          }}
        >
          <Box p={4}>
            {filteredGroups.map((group) => (
              <UnstyledButton
                key={group}
                onClick={() => handleSelect(group)}
                w="100%"
                py={6}
                px={8}
                style={{
                  display: "block",
                  textAlign: "left",
                  fontSize: "var(--mantine-font-size-xs)",
                  fontWeight: 400,
                  borderRadius: "var(--mantine-radius-sm)",
                }}
                styles={{
                  root: {
                    "&:hover": {
                      backgroundColor: "var(--mantine-color-default-hover)",
                    },
                  },
                }}
              >
                {group}
              </UnstyledButton>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

interface MuscleGroupTagsProps {
  muscles: string[];
  maxVisible?: number;
  size?: "sm" | "default";
}

export function MuscleGroupTags({
  muscles,
  maxVisible = 3,
  size = "default",
}: MuscleGroupTagsProps) {
  const visible = muscles.slice(0, maxVisible);
  const remaining = muscles.length - maxVisible;

  const badgeSize = size === "sm" ? "xs" : "sm";
  const badgeStyles = size === "sm" ? { fontSize: 10, padding: "0 4px" } : undefined;

  return (
    <Group gap={4} wrap="wrap">
      {visible.map((muscle) => (
        <Badge key={muscle} size={badgeSize} variant="outline" color="gray" style={badgeStyles}>
          {muscle}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge size={badgeSize} variant="outline" color="gray" style={badgeStyles}>
          +{remaining} more
        </Badge>
      )}
    </Group>
  );
}
