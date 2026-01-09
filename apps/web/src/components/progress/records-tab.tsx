import { useQuery } from "@tanstack/react-query";
import {
  IconArrowUp,
  IconCalendar,
  IconBarbell,
  IconFilter,
  IconTrophy,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";

import dayjs from "dayjs";

import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type RecordType =
  | "one_rep_max"
  | "max_weight"
  | "max_reps"
  | "max_volume"
  | "best_time"
  | "longest_duration"
  | "longest_distance";

interface PersonalRecord {
  id: number;
  exerciseId: number;
  exerciseName: string;
  recordType: RecordType;
  value: number;
  unit: string;
  achievedAt: string;
  previousValue: number | null;
}

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

function PRCard({ record }: { record: PersonalRecord }) {
  const improvement = record.previousValue ? record.value - record.previousValue : null;
  const improvementPercent = record.previousValue
    ? ((record.value - record.previousValue) / record.previousValue) * 100
    : null;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
              <IconTrophy className="size-5" />
            </div>
            <div>
              <p className="font-medium">{record.exerciseName}</p>
              <Badge className={cn("mt-1 text-xs", PR_TYPE_COLORS[record.recordType])}>
                {PR_TYPE_LABELS[record.recordType]}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">
              {record.value}
              {record.unit}
            </p>
            <p className="text-xs text-muted-foreground">
              {dayjs(record.achievedAt).format("MMM D, YYYY")}
            </p>
          </div>
        </div>
        {improvement !== null && improvement > 0 && (
          <div className="mt-3 flex items-center gap-1 text-emerald-500">
            <IconArrowUp className="size-3" />
            <span className="text-xs font-medium">
              +{improvement.toFixed(1)}
              {record.unit}
              {improvementPercent !== null && ` (${improvementPercent.toFixed(1)}%)`}
            </span>
            <span className="text-xs text-muted-foreground">from previous PR</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecordsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<RecordType | "all">("all");
  const [groupByExercise, setGroupByExercise] = useState(false);

  const prSummary = useQuery(orpc.personalRecord.getSummary.queryOptions());
  const allRecords = useQuery(orpc.personalRecord.list.queryOptions({ input: { limit: 100 } }));
  const recentRecords = useQuery(
    orpc.personalRecord.getRecent.queryOptions({ input: { days: 30 } }),
  );

  const isLoading = prSummary.isLoading || allRecords.isLoading;

  // Transform API data to match expected shape
  const records: PersonalRecord[] = useMemo(() => {
    const data = allRecords.data as
      | {
          records?: Array<{
            id: number;
            exerciseId: number;
            recordType: RecordType;
            value: number;
            achievedAt: string | Date;
            exercise?: { name: string };
          }>;
        }
      | undefined;
    const apiRecords = data?.records ?? [];
    return apiRecords.map((r) => ({
      id: r.id,
      exerciseId: r.exerciseId,
      exerciseName: r.exercise?.name ?? `Exercise ${r.exerciseId}`,
      recordType: r.recordType,
      value: r.value,
      unit: r.recordType.includes("time") || r.recordType.includes("duration") ? "s" : "kg",
      achievedAt: typeof r.achievedAt === "string" ? r.achievedAt : r.achievedAt.toISOString(),
      previousValue: null,
    }));
  }, [allRecords.data]);

  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((r) => r.exerciseName.toLowerCase().includes(query));
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((r) => r.recordType === selectedType);
    }

    return filtered.sort(
      (a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime(),
    );
  }, [records, searchQuery, selectedType]);

  const groupedRecords = useMemo(() => {
    if (!groupByExercise) return null;

    return filteredRecords.reduce(
      (acc, record) => {
        if (!acc[record.exerciseName]) {
          acc[record.exerciseName] = [];
        }
        acc[record.exerciseName].push(record);
        return acc;
      },
      {} as Record<string, PersonalRecord[]>,
    );
  }, [filteredRecords, groupByExercise]);

  // Find most improved exercise (by count of PRs this month)
  const mostImproved = useMemo(() => {
    const data = recentRecords.data as
      | { records?: Array<{ exercise?: { name: string } }> }
      | Array<{ exercise?: { name: string } }>
      | undefined;
    const recentPRs = Array.isArray(data) ? data : (data?.records ?? []);
    if (recentPRs.length === 0) return null;

    const exerciseCounts = recentPRs.reduce(
      (acc, pr) => {
        const name = pr.exercise?.name ?? "Unknown";
        acc[name] = (acc[name] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const entries = Object.entries(exerciseCounts);
    if (entries.length === 0) return null;

    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const first = sorted[0];
    return first ? first[0] : null;
  }, [recentRecords.data]);

  if (isLoading) {
    return <RecordsTabSkeleton />;
  }

  const totalPRs = prSummary.data?.totalRecords ?? 0;
  const prsThisMonth = recentRecords.data?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
                <IconTrophy className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPRs}</p>
                <p className="text-xs text-muted-foreground">Total PRs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 text-emerald-500 flex size-10 items-center justify-center rounded-full">
                <IconCalendar className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{prsThisMonth}</p>
                <p className="text-xs text-muted-foreground">PRs This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/10 text-amber-500 flex size-10 items-center justify-center rounded-full">
                <IconBarbell className="size-5" />
              </div>
              <div>
                <p className="text-lg font-bold truncate">{mostImproved ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Most Improved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFilter className="size-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-48 flex-1 space-y-2">
              <Label htmlFor="search">Search Exercise</Label>
              <Input
                id="search"
                placeholder="Search by exercise name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Record Type</Label>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={selectedType === "all" ? "default" : "outline"}
                  size="xs"
                  onClick={() => setSelectedType("all")}
                >
                  All
                </Button>
                {(Object.keys(PR_TYPE_LABELS) as RecordType[]).map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="xs"
                    onClick={() => setSelectedType(type)}
                  >
                    {PR_TYPE_LABELS[type]}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Group By</Label>
              <div className="flex gap-1">
                <Button
                  variant={!groupByExercise ? "default" : "outline"}
                  size="xs"
                  onClick={() => setGroupByExercise(false)}
                >
                  Date
                </Button>
                <Button
                  variant={groupByExercise ? "default" : "outline"}
                  size="xs"
                  onClick={() => setGroupByExercise(true)}
                >
                  Exercise
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      {filteredRecords.length > 0 ? (
        groupByExercise && groupedRecords ? (
          <div className="space-y-6">
            {Object.entries(groupedRecords).map(([exerciseName, exerciseRecords]) => (
              <div key={exerciseName}>
                <h3 className="mb-3 text-sm font-medium">{exerciseName}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {exerciseRecords.map((record) => (
                    <PRCard key={record.id} record={record} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecords.map((record) => (
              <PRCard key={record.id} record={record} />
            ))}
          </div>
        )
      ) : (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={IconTrophy}
              title="No personal records"
              description="Complete workouts to start setting records"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RecordsTabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-20" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}
