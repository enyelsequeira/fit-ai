import { IconArrowUp, IconTrophy } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type RecordType =
  | "one_rep_max"
  | "max_weight"
  | "max_reps"
  | "max_volume"
  | "best_time"
  | "longest_duration"
  | "longest_distance";

const PR_TYPE_LABELS: Record<RecordType, string> = {
  one_rep_max: "Est. 1RM",
  max_weight: "Max Weight",
  max_reps: "Max Reps",
  max_volume: "Max Volume",
  best_time: "Best Time",
  longest_duration: "Longest Duration",
  longest_distance: "Longest Distance",
};

const PR_TYPE_COLORS: Record<RecordType, string> = {
  one_rep_max: "bg-purple-500/10 text-purple-500",
  max_weight: "bg-blue-500/10 text-blue-500",
  max_reps: "bg-green-500/10 text-green-500",
  max_volume: "bg-amber-500/10 text-amber-500",
  best_time: "bg-red-500/10 text-red-500",
  longest_duration: "bg-cyan-500/10 text-cyan-500",
  longest_distance: "bg-pink-500/10 text-pink-500",
};

interface PRCardProps {
  exerciseName: string;
  recordType: RecordType;
  value: number;
  unit: string;
  date: string;
  previousValue?: number | null;
}

export function PRCard({
  exerciseName,
  recordType,
  value,
  unit,
  date,
  previousValue,
}: PRCardProps) {
  const improvement = previousValue ? value - previousValue : null;
  const improvementPercent = previousValue ? ((value - previousValue) / previousValue) * 100 : null;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
              <IconTrophy className="size-5" />
            </div>
            <div>
              <p className="font-medium">{exerciseName}</p>
              <Badge className={cn("mt-1 text-xs", PR_TYPE_COLORS[recordType])}>
                {PR_TYPE_LABELS[recordType]}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">
              {value}
              {unit}
            </p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
        {improvement !== null && improvement > 0 && (
          <div className="mt-3 flex items-center gap-1 text-emerald-500">
            <IconArrowUp className="size-3" />
            <span className="text-xs font-medium">
              +{improvement.toFixed(1)}
              {unit}
              {improvementPercent !== null && ` (${improvementPercent.toFixed(1)}%)`}
            </span>
            <span className="text-xs text-muted-foreground">from previous PR</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { PR_TYPE_LABELS, PR_TYPE_COLORS };
export type { RecordType };
