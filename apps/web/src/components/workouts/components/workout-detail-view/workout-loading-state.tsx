import { Center, Container, Loader, Stack, Text } from "@mantine/core";

export function WorkoutLoadingState() {
  return (
    <Container size="lg" py="xl">
      <Center py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Loading workout...</Text>
        </Stack>
      </Center>
    </Container>
  );
}
