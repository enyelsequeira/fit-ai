import { Badge, Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconBarbell, IconCalendar, IconClipboardList } from "@tabler/icons-react";

import styles from "./template-preview-card.module.css";

type TemplatePreviewCardProps = {
  templateId: number;
  templateName: string;
  daysCount?: number;
  exerciseCount?: number;
};

export function TemplatePreviewCard({
  templateName,
  daysCount,
  exerciseCount,
}: TemplatePreviewCardProps) {
  return (
    <Card className={styles.card} withBorder radius="md" p="sm" ml={36} mt="xs" maw={350}>
      <Stack gap="xs">
        <Group gap="sm">
          <ThemeIcon variant="light" color="teal" size="md" radius="md">
            <IconClipboardList size={16} />
          </ThemeIcon>
          <div>
            <Text fz="sm" fw={600}>
              {templateName}
            </Text>
            <Text fz="xs" c="dimmed">
              New workout template created
            </Text>
          </div>
        </Group>

        <Group gap="lg">
          {daysCount !== undefined && daysCount > 0 && (
            <Group gap={4}>
              <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
              <Text fz="xs" c="dimmed">
                {daysCount} {daysCount === 1 ? "day" : "days"}
              </Text>
            </Group>
          )}
          {exerciseCount !== undefined && exerciseCount > 0 && (
            <Group gap={4}>
              <IconBarbell size={14} color="var(--mantine-color-dimmed)" />
              <Text fz="xs" c="dimmed">
                {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}
              </Text>
            </Group>
          )}
        </Group>

        <Badge variant="light" color="teal" size="sm" w="fit-content">
          View in Templates
        </Badge>
      </Stack>
    </Card>
  );
}
