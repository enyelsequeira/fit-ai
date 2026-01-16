/**
 * ChartContent - Renders the actual chart (Line or Area) for weight trends
 */

import { Box, Center } from "@mantine/core";
import { IconChartLine } from "@tabler/icons-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import { EmptyState } from "@/components/ui/state-views";
import { Skeleton } from "@/components/ui/skeleton";
import type { TrendChartDataPoint } from "./types";
import type { ChartType, ProcessedChartData } from "./weight-trend-chart-utils";
import { ChartTooltip } from "./chart-tooltip";
import styles from "./weight-trend-chart.module.css";

interface ChartContentProps {
  chartType: ChartType;
  processedData: ProcessedChartData;
  isLoading: boolean;
}

function ChartEmptyState() {
  return (
    <EmptyState
      icon={<IconChartLine size={48} stroke={1.5} />}
      title="No data available"
      message="Log measurements to see your trends over time."
    />
  );
}

function LoadingChartState() {
  return (
    <Center mih={280} p="md">
      <Skeleton h={200} w="100%" />
    </Center>
  );
}

function LegendFormatter(value: string) {
  return <span style={{ color: "var(--mantine-color-text)", fontSize: 12 }}>{value}</span>;
}

const chartMargin = { top: 10, right: 30, left: 0, bottom: 0 };

const axisTickStyle = { fontSize: 12, fill: "var(--mantine-color-dimmed)" };

const gridStroke = "var(--mantine-color-gray-3)";

const weightColor = "var(--mantine-color-blue-6)";
const bodyFatColor = "var(--mantine-color-orange-6)";

interface AreaChartViewProps {
  data: TrendChartDataPoint[];
  weightDomain: [number, number];
  hasWeight: boolean;
  hasBodyFat: boolean;
}

function AreaChartView({ data, weightDomain, hasWeight, hasBodyFat }: AreaChartViewProps) {
  return (
    <AreaChart data={data} margin={chartMargin}>
      <defs>
        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={weightColor} stopOpacity={0.3} />
          <stop offset="95%" stopColor={weightColor} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="bodyFatGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={bodyFatColor} stopOpacity={0.3} />
          <stop offset="95%" stopColor={bodyFatColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
      <XAxis
        dataKey="date"
        tick={axisTickStyle}
        tickLine={false}
        axisLine={{ stroke: gridStroke }}
      />
      <YAxis
        yAxisId="weight"
        domain={weightDomain}
        tick={axisTickStyle}
        tickLine={false}
        axisLine={false}
        tickFormatter={(value) => `${value}`}
      />
      {hasBodyFat && (
        <YAxis
          yAxisId="bodyFat"
          orientation="right"
          domain={[0, 50]}
          tick={axisTickStyle}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
      )}
      <Tooltip content={<ChartTooltip />} />
      <Legend verticalAlign="top" height={36} formatter={LegendFormatter} />
      {hasWeight && (
        <Area
          yAxisId="weight"
          type="monotone"
          dataKey="weight"
          name="Weight (kg)"
          stroke={weightColor}
          fill="url(#weightGradient)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: weightColor }}
          connectNulls
        />
      )}
      {hasBodyFat && (
        <Area
          yAxisId="bodyFat"
          type="monotone"
          dataKey="bodyFatPercentage"
          name="Body Fat (%)"
          stroke={bodyFatColor}
          fill="url(#bodyFatGradient)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: bodyFatColor }}
          connectNulls
        />
      )}
    </AreaChart>
  );
}

interface LineChartViewProps {
  data: TrendChartDataPoint[];
  weightDomain: [number, number];
  hasWeight: boolean;
  hasBodyFat: boolean;
}

function LineChartView({ data, weightDomain, hasWeight, hasBodyFat }: LineChartViewProps) {
  return (
    <LineChart data={data} margin={chartMargin}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
      <XAxis
        dataKey="date"
        tick={axisTickStyle}
        tickLine={false}
        axisLine={{ stroke: gridStroke }}
      />
      <YAxis
        yAxisId="weight"
        domain={weightDomain}
        tick={axisTickStyle}
        tickLine={false}
        axisLine={false}
        tickFormatter={(value) => `${value}`}
      />
      {hasBodyFat && (
        <YAxis
          yAxisId="bodyFat"
          orientation="right"
          domain={[0, 50]}
          tick={axisTickStyle}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
      )}
      <Tooltip content={<ChartTooltip />} />
      <Legend verticalAlign="top" height={36} formatter={LegendFormatter} />
      {hasWeight && (
        <Line
          yAxisId="weight"
          type="monotone"
          dataKey="weight"
          name="Weight (kg)"
          stroke={weightColor}
          strokeWidth={2}
          dot={{ r: 3, fill: weightColor }}
          activeDot={{ r: 5, fill: weightColor }}
          connectNulls
        />
      )}
      {hasBodyFat && (
        <Line
          yAxisId="bodyFat"
          type="monotone"
          dataKey="bodyFatPercentage"
          name="Body Fat (%)"
          stroke={bodyFatColor}
          strokeWidth={2}
          dot={{ r: 3, fill: bodyFatColor }}
          activeDot={{ r: 5, fill: bodyFatColor }}
          connectNulls
        />
      )}
    </LineChart>
  );
}

export function ChartContent({ chartType, processedData, isLoading }: ChartContentProps) {
  const { filteredData, weightDomain, hasData, hasWeight, hasBodyFat } = processedData;

  if (isLoading) {
    return <LoadingChartState />;
  }

  if (!hasData) {
    return <ChartEmptyState />;
  }

  return (
    <Box
      className={styles.chartContainer}
      data-chart-type={chartType}
      data-has-data={hasData ? "true" : "false"}
    >
      <ResponsiveContainer width="100%" height={280}>
        {chartType === "area" ? (
          <AreaChartView
            data={filteredData}
            weightDomain={weightDomain}
            hasWeight={hasWeight}
            hasBodyFat={hasBodyFat}
          />
        ) : (
          <LineChartView
            data={filteredData}
            weightDomain={weightDomain}
            hasWeight={hasWeight}
            hasBodyFat={hasBodyFat}
          />
        )}
      </ResponsiveContainer>
    </Box>
  );
}
