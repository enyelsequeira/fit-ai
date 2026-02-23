import { IconSettings } from "@tabler/icons-react";
import { Group, SegmentedControl, Stack, Switch, Text } from "@mantine/core";

import { FitAiCard, FitAiCardContent, FitAiCardHeader, FitAiCardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "../../queries/use-queries";
import { useUpdateNotifications, useUpdateUnits } from "../../hooks/use-mutations";

import styles from "./quick-settings.module.css";

export function QuickSettings() {
  const { data: settings, isLoading } = useSettings();
  const updateUnits = useUpdateUnits();
  const updateNotifications = useUpdateNotifications();

  if (isLoading) {
    return (
      <FitAiCard className={styles.settingsCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>
            <Group gap="xs">
              <IconSettings size={20} />
              Quick Settings
            </Group>
          </FitAiCardTitle>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Stack gap="sm">
            <Skeleton h={14} w={60} />
            <Skeleton h={32} w="100%" />
            <Skeleton h={32} w="100%" />
            <Skeleton h={14} w={100} />
            <Skeleton h={24} w="100%" />
            <Skeleton h={24} w="100%" />
            <Skeleton h={24} w="100%" />
          </Stack>
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  return (
    <FitAiCard className={styles.settingsCard}>
      <FitAiCardHeader>
        <FitAiCardTitle>
          <Group gap="xs">
            <IconSettings size={20} />
            Quick Settings
          </Group>
        </FitAiCardTitle>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Stack gap={0}>
          <Text className={styles.sectionTitle}>Units</Text>

          <div className={styles.settingRow}>
            <Group justify="space-between">
              <Text size="sm">Weight</Text>
              <SegmentedControl
                size="xs"
                value={settings?.weightUnit ?? "kg"}
                onChange={(value) => updateUnits.mutate({ weightUnit: value as "kg" | "lb" })}
                data={[
                  { label: "kg", value: "kg" },
                  { label: "lb", value: "lb" },
                ]}
              />
            </Group>
          </div>

          <div className={styles.settingRow}>
            <Group justify="space-between">
              <Text size="sm">Distance</Text>
              <SegmentedControl
                size="xs"
                value={settings?.distanceUnit ?? "km"}
                onChange={(value) => updateUnits.mutate({ distanceUnit: value as "km" | "mi" })}
                data={[
                  { label: "km", value: "km" },
                  { label: "mi", value: "mi" },
                ]}
              />
            </Group>
          </div>

          <Text className={styles.sectionTitle} mt="xs">
            Notifications
          </Text>

          <div className={styles.settingRow}>
            <Group justify="space-between">
              <Text size="sm">Workout reminders</Text>
              <Switch
                size="sm"
                checked={settings?.workoutReminders ?? true}
                onChange={(event) =>
                  updateNotifications.mutate({
                    workoutReminders: event.currentTarget.checked,
                  })
                }
              />
            </Group>
          </div>

          <div className={styles.settingRow}>
            <Group justify="space-between">
              <Text size="sm">PR notifications</Text>
              <Switch
                size="sm"
                checked={settings?.prNotifications ?? true}
                onChange={(event) =>
                  updateNotifications.mutate({
                    prNotifications: event.currentTarget.checked,
                  })
                }
              />
            </Group>
          </div>

          <div className={styles.settingRow}>
            <Group justify="space-between">
              <Text size="sm">Streak notifications</Text>
              <Switch
                size="sm"
                checked={settings?.streakNotifications ?? true}
                onChange={(event) =>
                  updateNotifications.mutate({
                    streakNotifications: event.currentTarget.checked,
                  })
                }
              />
            </Group>
          </div>
        </Stack>
      </FitAiCardContent>
    </FitAiCard>
  );
}
