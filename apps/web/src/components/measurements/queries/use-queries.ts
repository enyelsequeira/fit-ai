import type { TimePeriod } from "../types";

import { useQuery } from "@tanstack/react-query";

import {
  measurementLatestOptions,
  measurementListOptions,
  measurementTrendsOptions,
} from "./query-options";

export function useMeasurementLatest() {
  return useQuery(measurementLatestOptions());
}

export function useMeasurementList(params?: {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  return useQuery(measurementListOptions(params ?? {}));
}

export function useMeasurementTrends(params: {
  period: TimePeriod;
  startDate?: Date;
  endDate?: Date;
}) {
  return useQuery(measurementTrendsOptions(params));
}
