import { IconArrowDown, IconArrowUp, IconMinus } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

interface MeasurementCardProps {
  label: string;
  value: number | null;
  lastChange: number | null;
  startChange: number | null;
  unit?: string;
}

export function MeasurementCard({
  label,
  value,
  lastChange,
  startChange,
  unit = "cm",
}: MeasurementCardProps) {
  if (value === null) return null;

  const ChangeIcon = lastChange === null ? IconMinus : lastChange > 0 ? IconArrowUp : IconArrowDown;

  return (
    <div className="flex flex-col gap-1 rounded-none border border-border/50 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-bold">
        {value.toFixed(1)}
        {unit}
      </span>
      <div className="flex gap-2 text-xs">
        {lastChange !== null && (
          <span
            className={cn(
              "flex items-center gap-0.5",
              lastChange > 0
                ? "text-emerald-500"
                : lastChange < 0
                  ? "text-red-500"
                  : "text-muted-foreground",
            )}
          >
            <ChangeIcon className="size-3" />
            {Math.abs(lastChange).toFixed(1)} last
          </span>
        )}
        {startChange !== null && (
          <span className="text-muted-foreground">
            {startChange >= 0 ? "+" : ""}
            {startChange.toFixed(1)} total
          </span>
        )}
      </div>
    </div>
  );
}
