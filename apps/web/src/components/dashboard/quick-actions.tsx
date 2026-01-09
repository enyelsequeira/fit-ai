import { IconBarbell, IconClipboardCheck, IconTrophy } from "@tabler/icons-react";

import { Group } from "@mantine/core";

import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <Group gap="xs" wrap="wrap">
      <Button leftSection={<IconBarbell size={16} />}>Start Workout</Button>
      <Button variant="outline" leftSection={<IconClipboardCheck size={16} />}>
        Log Check-in
      </Button>
      <Button variant="outline" leftSection={<IconTrophy size={16} />}>
        View PRs
      </Button>
    </Group>
  );
}
