import type { LucideIcon } from "lucide-react";

import * as React from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.ComponentProps<"div"> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function EmptyState({
  className,
  icon: Icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn("flex flex-col items-center justify-center gap-4 py-12 text-center", className)}
      {...props}
    >
      {Icon && (
        <div
          data-slot="empty-state-icon"
          className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full"
        >
          <Icon className="size-6" />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <h3 data-slot="empty-state-title" className="text-foreground text-sm font-medium">
          {title}
        </h3>
        {description && (
          <p data-slot="empty-state-description" className="text-muted-foreground text-xs">
            {description}
          </p>
        )}
      </div>
      {action && <div data-slot="empty-state-action">{action}</div>}
    </div>
  );
}

export { EmptyState };
