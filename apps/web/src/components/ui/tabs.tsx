import type { TabsProps as MantineTabsProps } from "@mantine/core";

import { Tabs as MantineTabs } from "@mantine/core";
import { forwardRef } from "react";

interface TabsProps extends MantineTabsProps {}

const Tabs = forwardRef<HTMLDivElement, TabsProps>((props, ref) => {
  return <MantineTabs ref={ref} {...props} />;
});

Tabs.displayName = "Tabs";

function TabsList({ children, ...props }: React.ComponentProps<typeof MantineTabs.List>) {
  return <MantineTabs.List {...props}>{children}</MantineTabs.List>;
}

interface TabsTriggerProps extends React.ComponentProps<typeof MantineTabs.Tab> {
  value: string;
}

function TabsTrigger({ children, ...props }: TabsTriggerProps) {
  return <MantineTabs.Tab {...props}>{children}</MantineTabs.Tab>;
}

interface TabsContentProps extends React.ComponentProps<typeof MantineTabs.Panel> {
  value: string;
}

function TabsContent({ children, ...props }: TabsContentProps) {
  return <MantineTabs.Panel {...props}>{children}</MantineTabs.Panel>;
}

function TabsIndicator() {
  return null; // Mantine handles indicators internally
}

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsIndicator };
