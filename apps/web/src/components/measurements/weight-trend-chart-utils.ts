/**
 * Utility functions for WeightTrendChart data transformations
 */

import type { TrendChartDataPoint } from "./types";

/**
 * Chart type options for toggling between line and area charts
 */
export type ChartType = "line" | "area";

/**
 * Period options for the time period selector
 */
export const periodOptions = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "3 Months", value: "quarter" },
  { label: "Year", value: "year" },
  { label: "All", value: "all" },
] as const;

/**
 * Filter out data points with no weight or body fat values
 */
export function filterDataWithValues(data: TrendChartDataPoint[]): TrendChartDataPoint[] {
  return data.filter((d) => d.weight !== null || d.bodyFatPercentage !== null);
}

/**
 * Extract all weight values from data points
 */
export function extractWeights(data: TrendChartDataPoint[]): number[] {
  return data.map((d) => d.weight).filter((w): w is number => w !== null);
}

/**
 * Extract all body fat values from data points
 */
export function extractBodyFatValues(data: TrendChartDataPoint[]): number[] {
  return data.map((d) => d.bodyFatPercentage).filter((b): b is number => b !== null);
}

/**
 * Calculate the Y-axis domain for weight values with padding
 */
export function calculateWeightDomain(weights: number[]): [number, number] {
  if (weights.length === 0) {
    return [0, 100];
  }
  const minWeight = Math.min(...weights) - 2;
  const maxWeight = Math.max(...weights) + 2;
  return [minWeight, maxWeight];
}

/**
 * Process chart data and compute derived values
 */
export interface ProcessedChartData {
  filteredData: TrendChartDataPoint[];
  weights: number[];
  bodyFats: number[];
  weightDomain: [number, number];
  hasData: boolean;
  hasWeight: boolean;
  hasBodyFat: boolean;
}

export function processChartData(data: TrendChartDataPoint[]): ProcessedChartData {
  const filteredData = filterDataWithValues(data);
  const weights = extractWeights(filteredData);
  const bodyFats = extractBodyFatValues(filteredData);
  const weightDomain = calculateWeightDomain(weights);

  return {
    filteredData,
    weights,
    bodyFats,
    weightDomain,
    hasData: filteredData.length > 0,
    hasWeight: weights.length > 0,
    hasBodyFat: bodyFats.length > 0,
  };
}
