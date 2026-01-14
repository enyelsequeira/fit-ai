/**
 * Types for the measurements view components
 */

/**
 * Time period for filtering and displaying data
 */
export type TimePeriod = "week" | "month" | "quarter" | "year" | "all";

/**
 * Summary statistics derived from measurements
 */
export interface MeasurementsSummaryData {
  currentWeight: number | null;
  weightUnit: string;
  currentBodyFat: number | null;
  weightChange: number | null;
  bodyFatChange: number | null;
  measurementCount: number;
  lastMeasuredAt: Date | null;
  isLoading: boolean;
}

/**
 * Chart data point for trend charts
 */
export interface TrendChartDataPoint {
  date: string;
  weight: number | null;
  bodyFatPercentage: number | null;
}

/**
 * Measurement row for history table
 */
export interface MeasurementHistoryRow {
  id: number;
  date: Date;
  weight: number | null;
  weightUnit: string | null;
  bodyFatPercentage: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  leftArm: number | null;
  rightArm: number | null;
  leftThigh: number | null;
  rightThigh: number | null;
  notes: string | null;
}

/**
 * Props for the summary component
 */
export interface MeasurementsSummaryProps {
  summary: MeasurementsSummaryData;
  onLogMeasurement: () => void;
}

/**
 * Props for the trend chart
 */
export interface TrendChartProps {
  data: TrendChartDataPoint[];
  isLoading: boolean;
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

/**
 * Props for the history component
 */
export interface MeasurementsHistoryProps {
  measurements: MeasurementHistoryRow[];
  isLoading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}
