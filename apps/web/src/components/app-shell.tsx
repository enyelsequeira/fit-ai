import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import Header from "./header";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  /** Whether to use full width or container width */
  fullWidth?: boolean;
  /** Whether to include padding */
  noPadding?: boolean;
}

export default function AppShell({
  children,
  className,
  fullWidth = false,
  noPadding = false,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main
        className={cn("flex-1", !fullWidth && "container", !noPadding && "px-4 py-6", className)}
      >
        {children}
      </main>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
