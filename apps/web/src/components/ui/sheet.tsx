import type { DrawerProps } from "@mantine/core";

import { ActionIcon, Drawer, Group, Stack, Text, Title } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

type SheetSide = "top" | "bottom" | "left" | "right";

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  // Sheet is a container that manages state
  // The actual drawer is rendered via SheetContent
  return <>{children}</>;
}

function SheetTrigger({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <span onClick={onClick} style={{ cursor: "pointer" }}>
      {children}
    </span>
  );
}

function SheetClose({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function SheetPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function SheetBackdrop() {
  return null;
}

interface SheetContentProps extends Omit<DrawerProps, "opened" | "onClose"> {
  side?: SheetSide;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const positionMap: Record<SheetSide, DrawerProps["position"]> = {
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
};

function SheetContent({
  side = "right",
  children,
  open,
  onOpenChange,
  ...props
}: SheetContentProps) {
  return (
    <Drawer
      opened={open ?? false}
      onClose={() => onOpenChange?.(false)}
      position={positionMap[side]}
      size={side === "left" || side === "right" ? "sm" : "auto"}
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      withCloseButton={false}
      {...props}
    >
      <ActionIcon
        variant="subtle"
        size="sm"
        style={{ position: "absolute", top: 16, right: 16 }}
        onClick={() => onOpenChange?.(false)}
      >
        <IconX size={16} />
      </ActionIcon>
      {children}
    </Drawer>
  );
}

function SheetHeader({ children }: { children: React.ReactNode }) {
  return (
    <Stack gap="xs" mb="md">
      {children}
    </Stack>
  );
}

function SheetFooter({ children }: { children: React.ReactNode }) {
  return (
    <Group mt="auto" pt="md" gap="sm">
      {children}
    </Group>
  );
}

function SheetTitle({ children }: { children: React.ReactNode }) {
  return (
    <Title order={4} size="sm" fw={500}>
      {children}
    </Title>
  );
}

function SheetDescription({ children }: { children: React.ReactNode }) {
  return (
    <Text size="xs" c="dimmed">
      {children}
    </Text>
  );
}

function SheetBody({ children }: { children: React.ReactNode }) {
  return <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>;
}

export {
  Sheet,
  SheetPortal,
  SheetBackdrop,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetBody,
};
