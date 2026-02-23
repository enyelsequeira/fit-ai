import { IconUser } from "@tabler/icons-react";
import { Avatar, Group, Stack, Text } from "@mantine/core";

import { FitAiCard, FitAiCardContent, FitAiCardHeader, FitAiCardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./user-profile.module.css";

interface UserProfileProps {
  userName: string;
  userEmail: string;
  userInitials: string;
  userImage?: string | null;
  isLoading?: boolean;
}

export function UserProfile({
  userName,
  userEmail,
  userInitials,
  userImage,
  isLoading,
}: UserProfileProps) {
  if (isLoading) {
    return (
      <FitAiCard className={styles.profileCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>
            <Group gap="xs">
              <IconUser size={20} />
              Profile
            </Group>
          </FitAiCardTitle>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Group gap="md">
            <Skeleton h={48} w={48} circle />
            <Stack gap={4}>
              <Skeleton h={16} w={120} />
              <Skeleton h={14} w={180} />
            </Stack>
          </Group>
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  return (
    <FitAiCard className={styles.profileCard}>
      <FitAiCardHeader>
        <FitAiCardTitle>
          <Group gap="xs">
            <IconUser size={20} />
            Profile
          </Group>
        </FitAiCardTitle>
      </FitAiCardHeader>
      <FitAiCardContent>
        <div className={styles.profileHeader}>
          <Avatar src={userImage} size={48} radius="xl" color="blue">
            {userInitials}
          </Avatar>
          <Stack gap={2}>
            <Text fw={600}>{userName}</Text>
            <Text size="sm" c="dimmed">
              {userEmail}
            </Text>
          </Stack>
        </div>
      </FitAiCardContent>
    </FitAiCard>
  );
}
