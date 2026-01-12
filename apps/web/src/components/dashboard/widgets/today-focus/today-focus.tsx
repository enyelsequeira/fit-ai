import {
  IconAlertTriangle,
  IconBarbell,
  IconBed,
  IconClipboardCheck,
  IconFlame,
  IconTarget,
} from "@tabler/icons-react";

import { Badge, Box, Flex, RingProgress, Stack, Text, Title } from "@mantine/core";

import { FitAiButton } from "@/components/ui/button";
import { Card, FitAiCardContent, FitAiCardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./today-focus.module.css";

interface NearDeadlineGoal {
  name: string;
  daysLeft: number;
}

interface TodayFocusProps {
  userName: string;
  readinessScore?: number;
  recommendation?: string;
  currentStreak: number;
  streakAtRisk?: boolean;
  nearDeadlineGoals?: NearDeadlineGoal[];
  isLoading?: boolean;
  onStartWorkout?: () => void;
  onLogCheckIn?: () => void;
}

function getGreeting(): { greeting: string; message: string } {
  const hour = new Date().getHours();

  if (hour < 5) {
    return { greeting: "Good night", message: "Get some rest for tomorrow's gains" };
  }
  if (hour < 12) {
    return { greeting: "Good morning", message: "Ready to crush your goals today?" };
  }
  if (hour < 17) {
    return { greeting: "Good afternoon", message: "Keep the momentum going strong" };
  }
  if (hour < 21) {
    return { greeting: "Good evening", message: "Great time for an evening session" };
  }
  return { greeting: "Good night", message: "Rest up for tomorrow's workout" };
}

function getReadinessColor(score: number): string {
  if (score >= 70) return "teal";
  if (score >= 40) return "yellow";
  return "red";
}

function getReadinessLabel(score: number): string {
  if (score >= 70) return "Ready to Train";
  if (score >= 40) return "Light Training";
  return "Rest Recommended";
}

function GoalDeadlineItem({ goal }: { goal: NearDeadlineGoal }) {
  const isUrgent = goal.daysLeft <= 3;
  const color = isUrgent ? "red" : goal.daysLeft <= 7 ? "yellow" : "teal";

  return (
    <Flex align="center" gap="xs" className={styles.goalItem} style={{ animationDelay: "200ms" }}>
      <IconTarget size={14} style={{ color: `var(--mantine-color-${color}-6)`, flexShrink: 0 }} />
      <Text size="xs" lineClamp={1} style={{ flex: 1 }}>
        {goal.name}
      </Text>
      <Badge size="xs" variant="light" color={color}>
        {goal.daysLeft === 0
          ? "Today"
          : goal.daysLeft === 1
            ? "Tomorrow"
            : `${goal.daysLeft}d left`}
      </Badge>
    </Flex>
  );
}

export function TodayFocus({
  userName,
  readinessScore,
  recommendation,
  currentStreak,
  streakAtRisk = false,
  nearDeadlineGoals = [],
  isLoading = false,
  onStartWorkout,
  onLogCheckIn,
}: TodayFocusProps) {
  const { greeting, message } = getGreeting();

  if (isLoading) {
    return (
      <Card className={styles.card}>
        <FitAiCardHeader>
          <Stack gap="xs">
            <Skeleton h={28} w={200} />
            <Skeleton h={16} w={280} />
          </Stack>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Flex gap="lg" wrap="wrap" align="flex-start">
            <Flex align="center" gap="md">
              <Skeleton h={80} w={80} radius="xl" />
              <Stack gap="xs">
                <Skeleton h={20} w={120} />
                <Skeleton h={14} w={150} />
              </Stack>
            </Flex>
            <Stack gap="sm" style={{ flex: 1, minWidth: 200 }}>
              <Skeleton h={36} w="100%" />
              <Skeleton h={36} w="100%" />
            </Stack>
          </Flex>
        </FitAiCardContent>
      </Card>
    );
  }

  const hasReadiness = readinessScore !== undefined;
  const isRestDay = hasReadiness && readinessScore < 40;
  const primaryAction = isRestDay ? "Rest Day" : "Start Workout";
  const primaryIcon = isRestDay ? <IconBed size={18} /> : <IconBarbell size={18} />;

  const firstName = userName.split(" ")[0] ?? userName;

  return (
    <Card className={styles.card}>
      <FitAiCardHeader>
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Box className={styles.greetingSection}>
            <Title order={2} size="h3" className={styles.greeting}>
              {greeting}, {firstName}
            </Title>
            <Text c="dimmed" size="sm" className={styles.message}>
              {message}
            </Text>
          </Box>

          {currentStreak > 0 && (
            <Flex align="center" gap="xs" className={styles.streakBadge}>
              <IconFlame
                size={18}
                className={streakAtRisk ? styles.streakIconWarning : styles.streakIconActive}
              />
              <Text size="sm" fw={600}>
                {currentStreak} day streak
              </Text>
              {streakAtRisk && (
                <Badge
                  size="xs"
                  variant="light"
                  color="yellow"
                  leftSection={<IconAlertTriangle size={10} />}
                >
                  At risk
                </Badge>
              )}
            </Flex>
          )}
        </Flex>
      </FitAiCardHeader>

      <FitAiCardContent>
        <Flex gap="lg" wrap="wrap" align="flex-start">
          {/* Readiness Score Section */}
          {hasReadiness ? (
            <Flex align="center" gap="md" className={styles.readinessSection}>
              <RingProgress
                size={80}
                thickness={8}
                roundCaps
                sections={[{ value: readinessScore, color: getReadinessColor(readinessScore) }]}
                label={
                  <Text fz="lg" fw={700} ta="center" c={getReadinessColor(readinessScore)}>
                    {readinessScore}
                  </Text>
                }
                className={styles.ringProgress}
              />
              <Stack gap={4}>
                <Text
                  fw={600}
                  c={getReadinessColor(readinessScore)}
                  className={styles.readinessLabel}
                >
                  {recommendation ?? getReadinessLabel(readinessScore)}
                </Text>
                <Text size="xs" c="dimmed">
                  Readiness Score
                </Text>
              </Stack>
            </Flex>
          ) : (
            <Box className={styles.noReadinessSection}>
              <Stack align="center" gap="xs" ta="center">
                <Box className={styles.checkInIcon}>
                  <IconClipboardCheck size={28} />
                </Box>
                <Text size="sm" fw={500}>
                  Check in for personalized guidance
                </Text>
              </Stack>
            </Box>
          )}

          {/* Actions Section */}
          <Stack gap="sm" className={styles.actionsSection}>
            <FitAiButton
              onClick={isRestDay ? undefined : onStartWorkout}
              leftSection={primaryIcon}
              fullWidth
              className={styles.primaryAction}
              variant={isRestDay ? "secondary" : "default"}
            >
              {primaryAction}
            </FitAiButton>

            {!hasReadiness && (
              <FitAiButton
                variant="outline"
                onClick={onLogCheckIn}
                leftSection={<IconClipboardCheck size={16} />}
                fullWidth
                className={styles.secondaryAction}
              >
                Log Check-in
              </FitAiButton>
            )}
          </Stack>
        </Flex>

        {/* Goal Deadlines Section */}
        {nearDeadlineGoals.length > 0 && (
          <Box className={styles.goalsSection}>
            <Text size="xs" c="dimmed" fw={500} tt="uppercase" mb="xs">
              Upcoming Goals
            </Text>
            <Stack gap={6}>
              {nearDeadlineGoals.slice(0, 3).map((goal, index) => (
                <GoalDeadlineItem key={`${goal.name}-${index}`} goal={goal} />
              ))}
            </Stack>
          </Box>
        )}
      </FitAiCardContent>
    </Card>
  );
}

export function TodayFocusSkeleton() {
  return <TodayFocus userName="" currentStreak={0} isLoading={true} />;
}
