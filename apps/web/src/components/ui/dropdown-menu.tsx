import type { MenuProps } from "@mantine/core";

import { Menu, Text } from "@mantine/core";
import { IconCheck, IconChevronRight } from "@tabler/icons-react";

interface DropdownMenuProps extends MenuProps {
  children: React.ReactNode;
}

function DropdownMenu({ children, ...props }: DropdownMenuProps) {
  return (
    <Menu shadow="md" width={200} {...props}>
      {children}
    </Menu>
  );
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuTrigger({ children, ...props }: React.ComponentProps<typeof Menu.Target>) {
  return <Menu.Target {...props}>{children}</Menu.Target>;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  alignOffset?: number;
}

function DropdownMenuContent({ children }: DropdownMenuContentProps) {
  return <Menu.Dropdown>{children}</Menu.Dropdown>;
}

function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  inset?: boolean;
}

function DropdownMenuLabel({ children }: DropdownMenuLabelProps) {
  return <Menu.Label>{children}</Menu.Label>;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  inset?: boolean;
  variant?: "default" | "destructive";
  onClick?: () => void;
  disabled?: boolean;
}

function DropdownMenuItem({ children, variant, onClick, disabled }: DropdownMenuItemProps) {
  return (
    <Menu.Item
      color={variant === "destructive" ? "red" : undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Menu.Item>
  );
}

function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface DropdownMenuSubTriggerProps {
  children: React.ReactNode;
  inset?: boolean;
}

function DropdownMenuSubTrigger({ children }: DropdownMenuSubTriggerProps) {
  return <Menu.Item rightSection={<IconChevronRight size={14} />}>{children}</Menu.Item>;
}

function DropdownMenuSubContent({ children }: { children: React.ReactNode }) {
  return <Menu.Dropdown>{children}</Menu.Dropdown>;
}

interface DropdownMenuCheckboxItemProps {
  children: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function DropdownMenuCheckboxItem({
  children,
  checked,
  onCheckedChange,
}: DropdownMenuCheckboxItemProps) {
  return (
    <Menu.Item
      leftSection={checked ? <IconCheck size={14} /> : <span style={{ width: 14 }} />}
      onClick={() => onCheckedChange?.(!checked)}
    >
      {children}
    </Menu.Item>
  );
}

function DropdownMenuRadioGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface DropdownMenuRadioItemProps {
  children: React.ReactNode;
  value: string;
}

function DropdownMenuRadioItem({ children }: DropdownMenuRadioItemProps) {
  return <Menu.Item>{children}</Menu.Item>;
}

function DropdownMenuSeparator() {
  return <Menu.Divider />;
}

function DropdownMenuShortcut({ children }: { children: React.ReactNode }) {
  return (
    <Text size="xs" c="dimmed" ml="auto" style={{ fontVariantNumeric: "tabular-nums" }}>
      {children}
    </Text>
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
