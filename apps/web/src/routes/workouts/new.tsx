import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  IconArrowLeft,
  IconClock,
  IconBarbell,
  IconLoader2,
  IconPlayerPlay,
  IconSparkles,
  IconBolt,
} from "@tabler/icons-react";
import { toast } from "@/components/ui/sonner";
import z from "zod";

import {
  ActionIcon,
  Box,
  Button,
  Card,
  Center,
  Container,
  Flex,
  Group,
  Loader,
  Overlay,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { client, orpc } from "@/utils/orpc";

const searchSchema = z.object({
  from: z.enum(["template", "quick"]).optional(),
});

export const Route = createFileRoute("/workouts/new")({
  validateSearch: searchSchema,
  component: NewWorkoutRoute,
});

function NewWorkoutRoute() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = Route.useSearch();

  const templates = useQuery(
    orpc.template.list.queryOptions({
      input: { limit: 10 },
    }),
  );

  const createWorkoutMutation = useMutation({
    ...orpc.workout.create.mutationOptions(),
    onSuccess: (workout) => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout started!");
      navigate({ to: "/workouts/$workoutId", params: { workoutId: workout.id.toString() } });
    },
    onError: (error) => {
      toast.error("Failed to create workout", { description: error.message });
    },
  });

  const startFromTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return client.template.startWorkout({ id: templateId });
    },
    onSuccess: (workout) => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout started from template!");
      navigate({ to: "/workouts/$workoutId", params: { workoutId: workout.id.toString() } });
    },
    onError: (error) => {
      toast.error("Failed to start workout", { description: error.message });
    },
  });

  const handleStartEmpty = () => {
    createWorkoutMutation.mutate({});
  };

  const handleStartFromTemplate = (templateId: number) => {
    startFromTemplateMutation.mutate(templateId);
  };

  const isPending = createWorkoutMutation.isPending || startFromTemplateMutation.isPending;

  // Show template selection if `from=template`
  if (search.from === "template") {
    return (
      <Container py="lg" px="md" maw={600}>
        <Flex align="center" gap="md" mb="lg">
          <ActionIcon component={Link} to="/workouts/new" variant="subtle" size="md">
            <IconArrowLeft style={{ width: 16, height: 16 }} />
          </ActionIcon>
          <Box>
            <Title order={1} fz="xl" fw={600}>
              Select Template
            </Title>
            <Text fz="sm" c="dimmed">
              Choose a template to start your workout
            </Text>
          </Box>
        </Flex>

        {templates.isLoading ? (
          <Stack gap="sm">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} h={80} w="100%" />
            ))}
          </Stack>
        ) : templates.data?.length === 0 ? (
          <Card withBorder padding="xl">
            <Stack align="center" ta="center" py="md">
              <IconSparkles
                style={{ width: 40, height: 40, color: "var(--mantine-color-dimmed)" }}
              />
              <Text fz="sm" fw={500}>
                No templates yet
              </Text>
              <Text fz="xs" c="dimmed" mb="sm">
                Create a template to quickly start workouts
              </Text>
              <Button component={Link} to="/workouts/new" variant="outline" size="sm">
                Start Empty Workout
              </Button>
            </Stack>
          </Card>
        ) : (
          <Stack gap="sm">
            {templates.data?.map((template) => (
              <Card
                key={template.id}
                withBorder
                padding="md"
                style={{
                  cursor: "pointer",
                  transition: "background-color 150ms",
                }}
                onClick={() => !isPending && handleStartFromTemplate(template.id)}
              >
                <Stack gap="xs">
                  <Text fz="sm" fw={500}>
                    {template.name}
                  </Text>
                  {template.description && (
                    <Text fz="xs" c="dimmed">
                      {template.description}
                    </Text>
                  )}
                  <Group gap="md">
                    {template.estimatedDurationMinutes && (
                      <Group gap={4}>
                        <IconClock
                          style={{ width: 12, height: 12, color: "var(--mantine-color-dimmed)" }}
                        />
                        <Text fz="xs" c="dimmed">
                          {template.estimatedDurationMinutes} min
                        </Text>
                      </Group>
                    )}
                    <Group gap={4}>
                      <IconPlayerPlay
                        style={{ width: 12, height: 12, color: "var(--mantine-color-dimmed)" }}
                      />
                      <Text fz="xs" c="dimmed">
                        Used {template.timesUsed} times
                      </Text>
                    </Group>
                  </Group>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    );
  }

  return (
    <Container py="lg" px="md" maw={600}>
      <Flex align="center" gap="md" mb="lg">
        <ActionIcon component={Link} to="/workouts" variant="subtle" size="md">
          <IconArrowLeft style={{ width: 16, height: 16 }} />
        </ActionIcon>
        <Box>
          <Title order={1} fz="xl" fw={600}>
            Start Workout
          </Title>
          <Text fz="sm" c="dimmed">
            Choose how to start your workout
          </Text>
        </Box>
      </Flex>

      <Stack gap="md">
        {/* Empty Workout */}
        <Card
          withBorder
          padding="md"
          style={{
            cursor: "pointer",
            transition: "background-color 150ms",
          }}
          onClick={!isPending ? handleStartEmpty : undefined}
        >
          <Flex align="center" gap="sm">
            <Center w={40} h={40} style={{ backgroundColor: "var(--mantine-primary-color-light)" }}>
              <IconBarbell
                style={{ width: 20, height: 20, color: "var(--mantine-primary-color-filled)" }}
              />
            </Center>
            <Box>
              <Text fz="sm" fw={500}>
                Empty Workout
              </Text>
              <Text fz="xs" c="dimmed">
                Start from scratch and add exercises as you go
              </Text>
            </Box>
          </Flex>
        </Card>

        {/* From Template */}
        <Card
          withBorder
          padding="md"
          style={{
            cursor: "pointer",
            transition: "background-color 150ms",
          }}
          onClick={() =>
            !isPending && navigate({ to: "/workouts/new", search: { from: "template" } })
          }
        >
          <Flex align="center" gap="sm">
            <Center w={40} h={40} style={{ backgroundColor: "rgba(147, 51, 234, 0.1)" }}>
              <IconSparkles style={{ width: 20, height: 20, color: "rgb(147, 51, 234)" }} />
            </Center>
            <Box>
              <Text fz="sm" fw={500}>
                From Template
              </Text>
              <Text fz="xs" c="dimmed">
                Use a saved template to pre-populate exercises
              </Text>
            </Box>
          </Flex>
        </Card>

        {/* Quick Start (Last Workout) */}
        <Card
          withBorder
          padding="md"
          style={{
            cursor: "pointer",
            transition: "background-color 150ms",
            opacity: 0.5,
          }}
        >
          <Flex align="center" gap="sm">
            <Center w={40} h={40} style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}>
              <IconBolt style={{ width: 20, height: 20, color: "rgb(34, 197, 94)" }} />
            </Center>
            <Box>
              <Text fz="sm" fw={500}>
                Quick Start
              </Text>
              <Text fz="xs" c="dimmed">
                Repeat your last workout (coming soon)
              </Text>
            </Box>
          </Flex>
        </Card>
      </Stack>

      {isPending && (
        <Box
          pos="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          style={{
            backgroundColor: "rgba(var(--mantine-color-body-rgb), 0.8)",
            backdropFilter: "blur(4px)",
            zIndex: 50,
          }}
        >
          <Center h="100%">
            <Stack align="center" gap="sm">
              <Loader size="lg" />
              <Text fz="sm" c="dimmed">
                Creating workout...
              </Text>
            </Stack>
          </Center>
        </Box>
      )}
    </Container>
  );
}
