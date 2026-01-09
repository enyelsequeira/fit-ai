import { Link, createFileRoute } from "@tanstack/react-router";
import { IconBarbell, IconPlus, IconSparkles } from "@tabler/icons-react";
import { useState } from "react";

import { Box, Button, Container, Flex, Menu, Stack, Tabs, Text, Title } from "@mantine/core";

import { WorkoutList } from "@/components/workout/workout-list";

export const Route = createFileRoute("/workouts/")({
  component: WorkoutsIndexRoute,
});

function WorkoutsIndexRoute() {
  const [activeTab, setActiveTab] = useState<string | null>("all");

  return (
    <Container py="lg" px="md">
      {/* Header */}
      <Flex align="center" justify="space-between" mb="lg">
        <Box>
          <Title order={1} fz="xl" fw={600}>
            Workouts
          </Title>
          <Text fz="sm" c="dimmed">
            Track and manage your workout sessions
          </Text>
        </Box>

        <Flex align="center" gap="sm">
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <Button leftSection={<IconPlus style={{ width: 16, height: 16 }} />}>
                New Workout
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                component={Link}
                to="/workouts/new"
                leftSection={<IconBarbell style={{ width: 16, height: 16 }} />}
              >
                Empty Workout
              </Menu.Item>
              <Menu.Item
                component={Link}
                to="/workouts/new"
                search={{ from: "template" }}
                leftSection={<IconSparkles style={{ width: 16, height: 16 }} />}
              >
                From Template
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </Flex>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="all">All</Tabs.Tab>
          <Tabs.Tab value="in-progress">In Progress</Tabs.Tab>
          <Tabs.Tab value="completed">Completed</Tabs.Tab>
        </Tabs.List>

        <Stack mt="md">
          <Tabs.Panel value="all">
            <WorkoutList status="all" />
          </Tabs.Panel>

          <Tabs.Panel value="in-progress">
            <WorkoutList status="in-progress" />
          </Tabs.Panel>

          <Tabs.Panel value="completed">
            <WorkoutList status="completed" />
          </Tabs.Panel>
        </Stack>
      </Tabs>
    </Container>
  );
}
