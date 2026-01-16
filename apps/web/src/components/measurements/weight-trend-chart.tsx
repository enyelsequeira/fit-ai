/**
 * WeightTrendChart - Line/Area chart showing weight and body fat trends
 * Uses Recharts for visualization (compatible with Mantine styling)
 */

import { useMemo, useState } from "react";
import { FitAiCard, FitAiCardContent } from "@/components/ui/card";
import type { TimePeriod, TrendChartDataPoint } from "./types";
import type { ChartType } from "./weight-trend-chart-utils";
import { processChartData } from "./weight-trend-chart-utils";
import { ChartHeader } from "./chart-header";
import { ChartContent } from "./chart-content";
import styles from "./weight-trend-chart.module.css";

interface WeightTrendChartProps {
  data: TrendChartDataPoint[];
  isLoading: boolean;
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

export function WeightTrendChart({
  data,
  isLoading,
  period,
  onPeriodChange,
}: WeightTrendChartProps) {
  const [chartType, setChartType] = useState<ChartType>("area");

  const processedData = useMemo(() => processChartData(data), [data]);

  return (
    <FitAiCard
      className={styles.chartCard}
      data-loading={isLoading ? "true" : undefined}
      data-empty={!processedData.hasData && !isLoading ? "true" : undefined}
    >
      <ChartHeader
        chartType={chartType}
        onChartTypeChange={setChartType}
        period={period}
        onPeriodChange={onPeriodChange}
      />
      <FitAiCardContent>
        <ChartContent chartType={chartType} processedData={processedData} isLoading={isLoading} />
      </FitAiCardContent>
    </FitAiCard>
  );
}
