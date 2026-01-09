import { useQuery } from "@tanstack/react-query";
import { IconBarbell, IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";

import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { orpc } from "@/utils/orpc";

type ExerciseCategory =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "cardio"
  | "compound"
  | "flexibility"
  | "other";

const EXERCISE_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "legs", label: "Legs" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
  { value: "compound", label: "Compound" },
] as const;

interface Exercise {
  id: number;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment: string | null;
  exerciseType: string;
}

interface ExerciseSearchProps {
  onSelect: (exercise: Exercise) => void;
  selectedExerciseIds?: number[];
  className?: string;
}

function ExerciseSearch({ onSelect, selectedExerciseIds = [] }: ExerciseSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const exercises = useQuery(
    orpc.exercise.list.queryOptions({
      input: {
        search: searchQuery || undefined,
        category: selectedCategory !== "all" ? (selectedCategory as ExerciseCategory) : undefined,
        limit: 50,
        offset: 0,
      },
    }),
  );

  const filteredExercises = useMemo(() => {
    if (!exercises.data?.exercises) return [];
    return exercises.data.exercises.filter((ex) => !selectedExerciseIds.includes(ex.id));
  }, [exercises.data, selectedExerciseIds]);

  const groupedExercises = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    for (const exercise of filteredExercises) {
      const category = exercise.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(exercise);
    }
    return groups;
  }, [filteredExercises]);

  return (
    <Stack gap="md">
      {/* Search Input */}
      <Box pos="relative">
        <TextInput
          type="search"
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftSection={
            <IconSearch style={{ width: 16, height: 16, color: "var(--mantine-color-dimmed)" }} />
          }
        />
      </Box>

      {/* Category Filters */}
      <Group gap={6}>
        {EXERCISE_CATEGORIES.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "filled" : "default"}
            size="xs"
            onClick={() => setSelectedCategory(category.value)}
            style={{ borderRadius: 0 }}
          >
            {category.label}
          </Button>
        ))}
      </Group>

      {/* Exercise List */}
      <ScrollArea h={400} mx={-8}>
        {exercises.isLoading ? (
          <Center py="xl">
            <Loader size="md" />
          </Center>
        ) : filteredExercises.length === 0 ? (
          <Stack align="center" justify="center" py="xl" ta="center">
            <IconBarbell style={{ width: 32, height: 32, color: "var(--mantine-color-dimmed)" }} />
            <Text fz="sm" c="dimmed">
              No exercises found
            </Text>
            {searchQuery && (
              <Text fz="xs" c="dimmed">
                Try a different search term
              </Text>
            )}
          </Stack>
        ) : selectedCategory === "all" ? (
          // Grouped view
          <Stack gap="md">
            {Object.entries(groupedExercises).map(([category, categoryExercises]) => (
              <Box key={category}>
                <Text
                  fz="xs"
                  fw={500}
                  c="dimmed"
                  tt="uppercase"
                  px="xs"
                  mb="xs"
                  style={{ letterSpacing: "0.05em" }}
                >
                  {category}
                </Text>
                <Stack gap={2}>
                  {categoryExercises.map((exercise) => (
                    <ExerciseItem
                      key={exercise.id}
                      exercise={exercise}
                      onClick={() => onSelect(exercise)}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          // Flat view
          <Stack gap={2}>
            {filteredExercises.map((exercise) => (
              <ExerciseItem
                key={exercise.id}
                exercise={exercise}
                onClick={() => onSelect(exercise)}
              />
            ))}
          </Stack>
        )}
      </ScrollArea>
    </Stack>
  );
}

interface ExerciseItemProps {
  exercise: Exercise;
  onClick: () => void;
  isSelected?: boolean;
}

function ExerciseItem({ exercise, onClick, isSelected }: ExerciseItemProps) {
  return (
    <Button
      variant="subtle"
      fullWidth
      onClick={onClick}
      justify="flex-start"
      h="auto"
      py="xs"
      px="xs"
      styles={{
        root: {
          borderRadius: 0,
          backgroundColor: isSelected ? "var(--mantine-color-blue-light)" : undefined,
        },
        inner: {
          justifyContent: "flex-start",
        },
      }}
    >
      <Flex align="center" gap="sm" w="100%">
        <Center
          w={32}
          h={32}
          style={{
            flexShrink: 0,
            backgroundColor: "var(--mantine-color-default-hover)",
          }}
        >
          <IconBarbell style={{ width: 16, height: 16, color: "var(--mantine-color-dimmed)" }} />
        </Center>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fz="sm" fw={500} truncate>
            {exercise.name}
          </Text>
          <Group gap="xs">
            {exercise.equipment && (
              <Text fz="xs" c="dimmed">
                {exercise.equipment}
              </Text>
            )}
            {exercise.muscleGroups.length > 0 && (
              <>
                {exercise.equipment && (
                  <Text fz="xs" c="dimmed">
                    -
                  </Text>
                )}
                <Text fz="xs" c="dimmed" truncate>
                  {exercise.muscleGroups.slice(0, 2).join(", ")}
                </Text>
              </>
            )}
          </Group>
        </Box>
        <Badge variant="light" size="xs" tt="capitalize">
          {exercise.exerciseType}
        </Badge>
      </Flex>
    </Button>
  );
}

export { ExerciseSearch };
export type { Exercise };
