import { Medal, Trophy } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PersonalRecord {
  id: number;
  exerciseName: string;
  recordType: string;
  value: number;
  displayUnit: string | null;
  achievedAt: Date;
}

interface RecentPRsProps {
  records: PersonalRecord[];
  isLoading?: boolean;
}

function formatRecordType(type: string): string {
  const types: Record<string, string> = {
    one_rep_max: "1RM",
    max_weight: "Max Weight",
    max_reps: "Max Reps",
    max_volume: "Max Volume",
    best_time: "Best Time",
    longest_duration: "Duration",
    longest_distance: "Distance",
  };
  return types[type] ?? type;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatValue(value: number, recordType: string, unit: string | null): string {
  if (recordType === "max_reps") {
    return `${value} reps`;
  }
  if (recordType === "best_time" || recordType === "longest_duration") {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }
  if (recordType === "longest_distance") {
    return value >= 1000 ? `${(value / 1000).toFixed(2)} km` : `${value} m`;
  }
  return `${value} ${unit ?? "kg"}`;
}

function PRItem({ record }: { record: PersonalRecord }) {
  return (
    <div className="flex items-center gap-3 rounded-lg p-2">
      <div className="bg-yellow-500/10 text-yellow-500 flex h-8 w-8 items-center justify-center rounded-full">
        <Medal className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">{record.exerciseName}</p>
        <p className="text-muted-foreground text-xs">{formatRecordType(record.recordType)}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-sm">
          {formatValue(record.value, record.recordType, record.displayUnit)}
        </p>
        <p className="text-muted-foreground text-xs">{formatDate(record.achievedAt)}</p>
      </div>
    </div>
  );
}

function PRItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg p-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1">
        <Skeleton className="mb-1 h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="text-right">
        <Skeleton className="mb-1 h-4 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function RecentPRs({ records, isLoading }: RecentPRsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Recent PRs
        </CardTitle>
        <CardDescription>Personal records in the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <PRItemSkeleton key={i} />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="py-6 text-center">
            <Trophy className="text-muted-foreground mx-auto mb-2 h-10 w-10" />
            <p className="text-muted-foreground text-sm">Complete workouts to start tracking PRs</p>
          </div>
        ) : (
          <div className="space-y-1">
            {records.map((record) => (
              <PRItem key={record.id} record={record} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentPRsSkeleton() {
  return <RecentPRs records={[]} isLoading={true} />;
}
