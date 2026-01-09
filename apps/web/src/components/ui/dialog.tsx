import type { ModalProps } from "@mantine/core";

import { Group, Modal, Stack, Text, Title } from "@mantine/core";

interface DialogProps extends ModalProps {
  children: React.ReactNode;
}

function Dialog({ children, ...props }: DialogProps) {
  return (
    <Modal centered overlayProps={{ backgroundOpacity: 0.55, blur: 3 }} {...props}>
      {children}
    </Modal>
  );
}

interface DialogTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
}

function DialogTrigger({ children, onClick }: DialogTriggerProps) {
  return (
    <span onClick={onClick} style={{ cursor: "pointer" }}>
      {children}
    </span>
  );
}

function DialogContent({ children }: { children: React.ReactNode }) {
  return <Stack gap="md">{children}</Stack>;
}

function DialogHeader({ children }: { children: React.ReactNode }) {
  return <Stack gap="xs">{children}</Stack>;
}

function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <Group justify="flex-end" mt="md" gap="sm">
      {children}
    </Group>
  );
}

function DialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <Title order={3} size="sm" fw={500}>
      {children}
    </Title>
  );
}

function DialogDescription({ children }: { children: React.ReactNode }) {
  return (
    <Text size="xs" c="dimmed">
      {children}
    </Text>
  );
}

function DialogClose({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DialogBackdrop() {
  return null;
}

export {
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
