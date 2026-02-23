import type { RecordTypeFilter } from "../types";

import { orpc } from "@/utils/orpc";

export function recordsListOptions(params?: {
  exerciseId?: number;
  recordType?: Exclude<RecordTypeFilter, "all">;
  limit?: number;
  offset?: number;
}) {
  return orpc.personalRecord.list.queryOptions({
    input: {
      exerciseId: params?.exerciseId,
      recordType: params?.recordType,
      limit: params?.limit ?? 100,
      offset: params?.offset ?? 0,
    },
  });
}

export function recentRecordsOptions(params?: { days?: number; limit?: number }) {
  return orpc.personalRecord.getRecent.queryOptions({
    input: {
      days: params?.days ?? 30,
      limit: params?.limit ?? 20,
    },
  });
}

export function recordsSummaryOptions() {
  return orpc.personalRecord.getSummary.queryOptions();
}

export function recordByIdOptions(params: { id: number }) {
  return orpc.personalRecord.getById.queryOptions({
    input: { id: params.id },
  });
}

export function recordsByExerciseOptions(params: { exerciseId: number }) {
  return orpc.personalRecord.getByExercise.queryOptions({
    input: { exerciseId: params.exerciseId },
  });
}
