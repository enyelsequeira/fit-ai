import { useMemo, useState } from "react";

import { FitAiButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PRCard, PR_TYPE_LABELS } from "./pr-card";
import type { RecordType } from "./pr-card";

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

interface PRListProps {
  records: PersonalRecord[];
  loading?: boolean;
}

export function PRList({ records, loading }: PRListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<RecordType | "all">("all");
  const [groupByExercise, setGroupByExercise] = useState(false);

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

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-none bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
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
            <FitAiButton
              variant={selectedType === "all" ? "default" : "outline"}
              size="xs"
              onClick={() => setSelectedType("all")}
            >
              All
            </FitAiButton>
            {(Object.keys(PR_TYPE_LABELS) as RecordType[]).map((type) => (
              <FitAiButton
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="xs"
                onClick={() => setSelectedType(type)}
              >
                {PR_TYPE_LABELS[type]}
              </FitAiButton>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Group By</Label>
          <div className="flex gap-1">
            <FitAiButton
              variant={!groupByExercise ? "default" : "outline"}
              size="xs"
              onClick={() => setGroupByExercise(false)}
            >
              Date
            </FitAiButton>
            <FitAiButton
              variant={groupByExercise ? "default" : "outline"}
              size="xs"
              onClick={() => setGroupByExercise(true)}
            >
              Exercise
            </FitAiButton>
          </div>
        </div>
      </div>

      {/* Records */}
      {filteredRecords.length > 0 ? (
        groupByExercise && groupedRecords ? (
          <div className="space-y-6">
            {Object.entries(groupedRecords).map(([exerciseName, exerciseRecords]) => (
              <div key={exerciseName}>
                <h3 className="mb-3 text-sm font-medium">{exerciseName}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {exerciseRecords.map((record) => (
                    <PRCard
                      key={record.id}
                      exerciseName={record.exerciseName}
                      recordType={record.recordType}
                      value={record.value}
                      unit={record.unit}
                      date={record.achievedAt}
                      previousValue={record.previousValue}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecords.map((record) => (
              <PRCard
                key={record.id}
                exerciseName={record.exerciseName}
                recordType={record.recordType}
                value={record.value}
                unit={record.unit}
                date={record.achievedAt}
                previousValue={record.previousValue}
              />
            ))}
          </div>
        )
      ) : (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {records.length === 0
            ? "No personal records yet. Complete workouts to start setting records."
            : "No records match your filters."}
        </div>
      )}
    </div>
  );
}
