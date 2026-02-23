/**
 * Body Measurements components exports
 */

export { MeasurementsView } from "./measurements-view";
export { MeasurementsSummary } from "./measurements-summary";
export { WeightTrendChart } from "./weight-trend-chart";
export { MeasurementsHistory } from "./measurements-history";
export { LogMeasurementModal } from "./log-measurement-modal";
export { useMeasurementsData } from "./use-measurements-data";

// Query and mutation hooks
export {
  measurementLatestOptions,
  measurementListOptions,
  measurementTrendsOptions,
} from "./queries/query-options";
export {
  useMeasurementLatest,
  useMeasurementList,
  useMeasurementTrends,
} from "./queries/use-queries";
export {
  useCreateMeasurement,
  useUpdateMeasurement,
  useDeleteMeasurement,
} from "./hooks/use-mutations";

// Sub-components for advanced usage
export { QuickWeightForm } from "./quick-weight-form";
export { DetailedMeasurementsForm } from "./detailed-measurements-form";
export { MeasurementField } from "./measurement-field";
export {
  TorsoMeasurements,
  UpperBodyMeasurements,
  ArmsMeasurements,
  LegsMeasurements,
  DetailedMeasurementsFields,
} from "./body-measurement-sections";

// Type exports
export type {
  TimePeriod,
  MeasurementsSummaryData,
  TrendChartDataPoint,
  MeasurementHistoryRow,
  TrendChartProps,
  MeasurementsHistoryProps,
} from "./types";

export type {
  MeasurementFormValues,
  MeasurementForm,
  MeasurementFieldName,
} from "./measurement-types";
export { defaultMeasurementValues } from "./measurement-types";
