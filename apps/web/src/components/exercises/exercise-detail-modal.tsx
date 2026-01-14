/**
 * ExerciseDetailModal - Modal showing full exercise details
 */

import {
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Group,
  List,
  Modal,
  Paper,
  ScrollArea,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconBarbell, IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import { CategoryBadge, categoryConfig } from "@/components/exercise/category-badge";
import { EquipmentIcon } from "@/components/exercise/equipment-icon";
import {
  ExerciseForceBadge,
  ExerciseLevelBadge,
  ExerciseMechanicBadge,
} from "@/components/exercise/exercise-level-badge";
import { ErrorState } from "@/components/ui/state-views";
import { orpc } from "@/utils/orpc";

interface ExerciseDetailModalProps {
  exerciseId: number | null;
  onClose: () => void;
  onAddToWorkout?: (exerciseId: number) => void;
}

export function ExerciseDetailModal({
  exerciseId,
  onClose,
  onAddToWorkout,
}: ExerciseDetailModalProps) {
  const exerciseQuery = useQuery(
    orpc.exercise.getById.queryOptions({
      id: exerciseId ?? 0,
    }),
  );

  const exercise = exerciseQuery.data;
  const isLoading = exerciseQuery.isLoading;
  const isError = exerciseQuery.isError;

  return (
    <Modal
      opened={exerciseId !== null}
      onClose={onClose}
      title={isLoading ? <Skeleton h={24} w={150} /> : <Title order={4}>{exercise?.name}</Title>}
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      {isLoading && <ExerciseDetailSkeleton />}

      {isError && (
        <ErrorState
          title="Error loading exercise"
          message="Failed to load exercise details. Please try again."
        />
      )}

      {exercise && !isLoading && (
        <Stack gap="md">
          {/* Exercise Image */}
          <ExerciseDetailImage
            src={exercise.primaryImage}
            alt={exercise.name}
            category={exercise.category}
          />

          {/* Badges */}
          <Group gap="xs" wrap="wrap">
            <CategoryBadge category={exercise.category} />
            {exercise.level && <ExerciseLevelBadge level={exercise.level} />}
            {exercise.force && <ExerciseForceBadge force={exercise.force} />}
            {exercise.mechanic && <ExerciseMechanicBadge mechanic={exercise.mechanic} />}
            {!exercise.isDefault && (
              <Badge variant="light" color="teal">
                Custom
              </Badge>
            )}
          </Group>

          <Divider />

          {/* Description */}
          {exercise.description && (
            <Box>
              <Text fw={500} mb="xs">
                Description
              </Text>
              <Text size="sm" c="dimmed">
                {exercise.description}
              </Text>
            </Box>
          )}

          {/* Details Grid */}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {/* Equipment */}
            <Paper withBorder p="sm" radius="sm">
              <Text fw={500} size="sm" mb="xs">
                Equipment
              </Text>
              {exercise.equipment ? (
                <EquipmentIcon equipment={exercise.equipment} showLabel />
              ) : (
                <Text size="sm" c="dimmed">
                  No equipment (bodyweight)
                </Text>
              )}
            </Paper>

            {/* Exercise Type */}
            <Paper withBorder p="sm" radius="sm">
              <Text fw={500} size="sm" mb="xs">
                Exercise Type
              </Text>
              <Badge variant="light" tt="capitalize">
                {exercise.exerciseType}
              </Badge>
            </Paper>
          </SimpleGrid>

          {/* Muscle Groups */}
          {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
            <Box>
              <Text fw={500} mb="xs">
                Muscle Groups
              </Text>
              <Group gap="xs" wrap="wrap">
                {exercise.muscleGroups.map((muscle: string) => (
                  <Badge key={muscle} variant="outline" tt="capitalize">
                    {muscle}
                  </Badge>
                ))}
              </Group>
            </Box>
          )}

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <Box>
              <Text fw={500} mb="xs">
                Instructions
              </Text>
              <List type="ordered" spacing="xs" size="sm">
                {exercise.instructions.map((instruction: string, index: number) => (
                  <List.Item key={index}>{instruction}</List.Item>
                ))}
              </List>
            </Box>
          )}

          {/* Image Gallery */}
          {exercise.images && exercise.images.length > 1 && (
            <Box>
              <Text fw={500} mb="xs">
                Images
              </Text>
              <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
                {exercise.images.slice(0, 6).map((image: string, index: number) => (
                  <Box
                    key={index}
                    style={{
                      borderRadius: "var(--mantine-radius-sm)",
                      overflow: "hidden",
                      aspectRatio: "16/9",
                    }}
                  >
                    <img
                      src={image}
                      alt={`${exercise.name} - Image ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}

          <Divider />

          {/* Actions */}
          <Group justify="flex-end">
            {onAddToWorkout && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  onAddToWorkout(exercise.id);
                  onClose();
                }}
              >
                Add to Workout
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}

interface ExerciseDetailImageProps {
  src: string | null | undefined;
  alt: string;
  category: string;
}

function ExerciseDetailImage({ src, alt, category }: ExerciseDetailImageProps) {
  const config = categoryConfig[category as keyof typeof categoryConfig] ?? categoryConfig.other;
  const Icon = config?.icon ?? IconBarbell;

  if (!src) {
    return (
      <Center
        h={200}
        bg="var(--mantine-color-gray-light)"
        style={{ borderRadius: "var(--mantine-radius-md)" }}
      >
        <Icon
          size={48}
          color={config?.color ?? "var(--mantine-color-gray-5)"}
          style={{ opacity: 0.5 }}
        />
      </Center>
    );
  }

  return (
    <Box
      h={200}
      style={{
        borderRadius: "var(--mantine-radius-md)",
        overflow: "hidden",
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </Box>
  );
}

function ExerciseDetailSkeleton() {
  return (
    <Stack gap="md">
      <Skeleton h={200} radius="md" />
      <Group gap="xs">
        <Skeleton h={24} w={80} radius="sm" />
        <Skeleton h={24} w={100} radius="sm" />
        <Skeleton h={24} w={60} radius="sm" />
      </Group>
      <Divider />
      <Box>
        <Skeleton h={16} w={100} mb="xs" />
        <Skeleton h={60} radius="sm" />
      </Box>
      <SimpleGrid cols={2} spacing="md">
        <Skeleton h={80} radius="sm" />
        <Skeleton h={80} radius="sm" />
      </SimpleGrid>
      <Box>
        <Skeleton h={16} w={120} mb="xs" />
        <Group gap="xs">
          <Skeleton h={24} w={60} radius="sm" />
          <Skeleton h={24} w={80} radius="sm" />
          <Skeleton h={24} w={70} radius="sm" />
        </Group>
      </Box>
    </Stack>
  );
}
