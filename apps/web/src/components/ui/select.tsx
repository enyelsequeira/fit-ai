import type { SelectProps as MantineSelectProps } from "@mantine/core";

import { Select as MantineSelect } from "@mantine/core";
import { forwardRef } from "react";

interface SelectProps extends Omit<MantineSelectProps, "data"> {
  data?: Array<{ value: string; label: string } | string>;
  children?: React.ReactNode;
}

const Select = forwardRef<HTMLInputElement, SelectProps>(({ data, children, ...props }, ref) => {
  return <MantineSelect ref={ref} size="sm" data={data ?? []} {...props} />;
});

Select.displayName = "Select";

// These are placeholder components for API compatibility
// Mantine Select uses a different pattern (data prop)
function SelectValue({ children }: { children?: React.ReactNode; placeholder?: string }) {
  return <>{children}</>;
}

function SelectTrigger({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function SelectContent({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function SelectGroup({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function SelectGroupLabel({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function SelectItem({ children }: { children?: React.ReactNode; value?: string }) {
  return <>{children}</>;
}

function SelectSeparator() {
  return null;
}

export {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
};
