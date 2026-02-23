/**
 * ChartContent - Renders the actual chart (Line or Area) for weight trends
 */

import type { TrendChartDataPoint } from "./types";
import type { ChartType, ProcessedChartData } from "./weight-trend-chart-utils";

import { Box, Center } from "@mantine/core";
import { IconChartLine } from "@tabler/icons-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/ui/state-views";
import { Skeleton } from "@/components/ui/skeleton";

import { ChartTooltip } from "./chart-tooltip";
import { chartConfig } from "./weight-trend-chart-utils";
import styles from "./weight-trend-chart.module.css";

const { margin, axisTickStyle, gridStroke, weightColor, bodyFatColor, bodyFatDomain } = chartConfig;

function LegendFormatter(value: string) {
  return <span style={{ color: "var(--mantine-color-text)", fontSize: 12 }}>{value}</span>;
}

interface SharedChartProps {
  data: TrendChartDataPoint[];
  weightDomain: [number, number];
  hasWeight: boolean;
  hasBodyFat: boolean;
}

function AreaChartView({ data, weightDomain, hasWeight, hasBodyFat }: SharedChartProps) {
  return (
    <AreaChart data={data} margin={margin}>
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
      />
      {hasBodyFat && (
        <YAxis
          yAxisId="bodyFat"
          orientation="right"
          domain={bodyFatDomain}
          tick={axisTickStyle}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
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

function LineChartView({ data, weightDomain, hasWeight, hasBodyFat }: SharedChartProps) {
  return (
    <LineChart data={data} margin={margin}>
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
      />
      {hasBodyFat && (
        <YAxis
          yAxisId="bodyFat"
          orientation="right"
          domain={bodyFatDomain}
          tick={axisTickStyle}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
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

interface ChartContentProps {
  chartType: ChartType;
  processedData: ProcessedChartData;
  isLoading: boolean;
}

export function ChartContent({ chartType, processedData, isLoading }: ChartContentProps) {
  const { filteredData, weightDomain, hasData, hasWeight, hasBodyFat } = processedData;

  if (isLoading) {
    return (
      <Center mih={280} p="md">
        <Skeleton h={200} w="100%" />
      </Center>
    );
  }

  if (!hasData) {
    return (
      <EmptyState
        icon={<IconChartLine size={48} stroke={1.5} />}
        title="No data available"
        message="Log measurements to see your trends over time."
      />
    );
  }

  const chartProps: SharedChartProps = { data: filteredData, weightDomain, hasWeight, hasBodyFat };

  return (
    <Box className={styles.chartContainer} data-chart-type={chartType}>
      <ResponsiveContainer width="100%" height={280}>
        {chartType === "area" ? (
          <AreaChartView {...chartProps} />
        ) : (
          <LineChartView {...chartProps} />
        )}
      </ResponsiveContainer>
    </Box>
  );
}
