import { getRouteApi } from "@tanstack/react-router";
import { Container, SimpleGrid, Stack } from "@mantine/core";

import { FitAiContentArea } from "@/components/ui/fit-ai-content-area/fit-ai-content-area";
import { PageHeader } from "@/components/ui/state-views";

import { ActivityOverview } from "./widgets/activity-overview/activity-overview";
import { GoalsSnapshot } from "./widgets/goals-snapshot/goals-snapshot";
import { QuickSettings } from "./widgets/quick-settings/quick-settings";
import { StatsOverview } from "./widgets/stats-overview/stats-overview";
import { UserProfile } from "./widgets/user-profile/user-profile";

const routeApi = getRouteApi("/dashboard");

export function DashboardView() {
  const { session } = routeApi.useRouteContext();

  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "";
  const userImage = session?.user?.image ?? null;
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Container fluid flex={1}>
      <FitAiContentArea>
        <Stack gap="md">
          <PageHeader title="Dashboard" description={`Welcome back, ${userName}`} />

          <StatsOverview />

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <Stack gap="md">
              <UserProfile
                userName={userName}
                userEmail={userEmail}
                userInitials={userInitials}
                userImage={userImage}
              />
              <ActivityOverview />
            </Stack>
            <Stack gap="md">
              <QuickSettings />
              <GoalsSnapshot />
            </Stack>
          </SimpleGrid>
        </Stack>
      </FitAiContentArea>
    </Container>
  );
}
