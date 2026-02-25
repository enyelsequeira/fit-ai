import { Badge, Group, Paper, Stack, Text } from "@mantine/core";

type ToolOutputDetailProps = {
  name: string;
  output: Record<string, unknown>;
};

export function ToolOutputDetail({ name, output }: ToolOutputDetailProps) {
  if (name === "search_exercises" && Array.isArray(output.exercises)) {
    const exercises = output.exercises as Array<{
      id: number;
      name: string;
      category: string;
      muscleGroups: string[];
      equipment: string | null;
    }>;
    if (exercises.length === 0) return null;

    return (
      <Paper p="xs" mt="xs" radius="sm" withBorder>
        <Stack gap={4}>
          {exercises.slice(0, 5).map((ex) => (
            <Group key={ex.id} gap="xs" justify="space-between">
              <Text fz="xs" fw={500}>
                {ex.name}
              </Text>
              <Group gap={4}>
                <Badge size="xs" variant="light" color="blue">
                  {ex.category}
                </Badge>
                {ex.equipment && (
                  <Badge size="xs" variant="light" color="gray">
                    {ex.equipment}
                  </Badge>
                )}
              </Group>
            </Group>
          ))}
          {exercises.length > 5 && (
            <Text fz="xs" c="dimmed">
              +{exercises.length - 5} more
            </Text>
          )}
        </Stack>
      </Paper>
    );
  }

  if (name === "get_progress_summary") {
    const goals = (output.activeGoals ?? []) as Array<{
      title: string;
      progressPercentage: number;
      goalType: string;
    }>;
    const prs = (output.recentPRs ?? []) as Array<{
      exerciseName: string;
      value: number;
      recordType: string;
    }>;

    return (
      <Paper p="xs" mt="xs" radius="sm" withBorder>
        <Stack gap="xs">
          {goals.length > 0 && (
            <div>
              <Text fz="xs" fw={600} mb={2}>
                Active Goals
              </Text>
              {goals.map((g, i) => (
                <Group key={i} gap="xs" justify="space-between">
                  <Text fz="xs">{g.title}</Text>
                  <Badge size="xs" variant="light" color="teal">
                    {Math.round(g.progressPercentage)}%
                  </Badge>
                </Group>
              ))}
            </div>
          )}
          {prs.length > 0 && (
            <div>
              <Text fz="xs" fw={600} mb={2}>
                Recent PRs
              </Text>
              {prs.map((pr, i) => (
                <Text key={i} fz="xs">
                  {pr.exerciseName}: {pr.value} ({pr.recordType.replace(/_/g, " ")})
                </Text>
              ))}
            </div>
          )}
          <Group gap="lg">
            <Text fz="xs">
              This week: <strong>{String(output.thisWeekWorkouts ?? 0)}</strong> workouts
            </Text>
            <Text fz="xs">
              Streak: <strong>{String(output.currentStreak ?? 0)}</strong> days
            </Text>
          </Group>
        </Stack>
      </Paper>
    );
  }

  if (name === "suggest_exercise_alternatives" && Array.isArray(output.alternatives)) {
    const alts = output.alternatives as Array<{
      id: number;
      name: string;
      equipment: string | null;
      overlapPercentage: number;
    }>;
    if (alts.length === 0) return null;

    return (
      <Paper p="xs" mt="xs" radius="sm" withBorder>
        <Stack gap={4}>
          {alts.map((alt) => (
            <Group key={alt.id} gap="xs" justify="space-between">
              <Text fz="xs" fw={500}>
                {alt.name}
              </Text>
              <Group gap={4}>
                <Badge size="xs" variant="light" color="green">
                  {Math.round(alt.overlapPercentage)}% match
                </Badge>
                {alt.equipment && (
                  <Badge size="xs" variant="light" color="gray">
                    {alt.equipment}
                  </Badge>
                )}
              </Group>
            </Group>
          ))}
        </Stack>
      </Paper>
    );
  }

  if (name === "log_workout") {
    return (
      <Paper p="xs" mt="xs" radius="sm" withBorder>
        <Text fz="xs">
          Logged <strong>{String(output.exerciseName)}</strong> — {String(output.setsLogged)} sets
          recorded
        </Text>
      </Paper>
    );
  }

  if (name === "list_user_templates" && Array.isArray(output.templates)) {
    const templates = output.templates as Array<{
      id: number;
      name: string;
      timesUsed: number;
    }>;
    if (templates.length === 0) return null;

    return (
      <Paper p="xs" mt="xs" radius="sm" withBorder>
        <Stack gap={4}>
          {templates.map((t) => (
            <Group key={t.id} gap="xs" justify="space-between">
              <Text fz="xs" fw={500}>
                {t.name}
              </Text>
              <Badge size="xs" variant="light" color="gray">
                used {t.timesUsed}x
              </Badge>
            </Group>
          ))}
        </Stack>
      </Paper>
    );
  }

  if (name === "get_template_details") {
    const days = (output.days ?? []) as Array<{
      name: string;
      exercises: Array<{ exerciseName: string }>;
    }>;

    return (
      <Paper p="xs" mt="xs" radius="sm" withBorder>
        <Text fz="xs" fw={600} mb={2}>
          {String(output.name)}
        </Text>
        <Stack gap={2}>
          {days.map((day, i) => (
            <Text key={i} fz="xs">
              {day.name}: {day.exercises.length} exercises
            </Text>
          ))}
        </Stack>
      </Paper>
    );
  }

  return null;
}
