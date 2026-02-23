import type { TimePeriod } from "../types";

import { orpc } from "@/utils/orpc";

export function measurementLatestOptions() {
  return orpc.bodyMeasurement.getLatest.queryOptions();
}

export function measurementListOptions(params: {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  return orpc.bodyMeasurement.list.queryOptions({
    input: {
      startDate: params.startDate,
      endDate: params.endDate,
      limit: params.limit ?? 100,
      offset: params.offset ?? 0,
    },
  });
}

export function measurementTrendsOptions(params: {
  period: TimePeriod;
  startDate?: Date;
  endDate?: Date;
}) {
  return orpc.bodyMeasurement.getTrends.queryOptions({
    input: {
      period: params.period,
      startDate: params.startDate,
      endDate: params.endDate,
    },
  });
}
