import type { CurveType } from "recharts/types/shape/Curve";

import * as React from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

// Chart color palette using CSS variables
const chartColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
  formatter?: (value: number, name: string) => string;
}

function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="bg-popover text-popover-foreground ring-foreground/10 rounded-none p-2 shadow-md ring-1">
      {label && <p className="text-muted-foreground mb-1 text-xs font-medium">{label}</p>}
      <div className="flex flex-col gap-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface BaseChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string | string[];
  height?: number;
  className?: string;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  tooltipFormatter?: (value: number, name: string) => string;
  colors?: string[];
}

interface LineChartProps extends BaseChartProps {
  curveType?: CurveType;
  strokeWidth?: number;
  dot?: boolean;
}

function LineChart({
  data,
  xKey,
  yKey,
  height = 300,
  className,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  tooltipFormatter,
  colors = chartColors,
  curveType = "monotone",
  strokeWidth = 2,
  dot = false,
}: LineChartProps) {
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          )}
          {showXAxis && (
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground fill-muted-foreground text-xs"
              tick={{ fontSize: 11 }}
            />
          )}
          {showYAxis && (
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground fill-muted-foreground text-xs"
              tick={{ fontSize: 11 }}
              width={40}
            />
          )}
          <Tooltip
            content={({ active, payload, label }) => (
              <ChartTooltip
                active={active}
                payload={payload as ChartTooltipProps["payload"]}
                label={label as string}
                formatter={tooltipFormatter}
              />
            )}
          />
          {yKeys.map((key, index) => (
            <Line
              key={key}
              type={curveType}
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={strokeWidth}
              dot={dot}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BarChartProps extends BaseChartProps {
  barRadius?: number;
  stacked?: boolean;
}

function BarChart({
  data,
  xKey,
  yKey,
  height = 300,
  className,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  tooltipFormatter,
  colors = chartColors,
  barRadius = 0,
  stacked = false,
}: BarChartProps) {
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          )}
          {showXAxis && (
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground fill-muted-foreground text-xs"
              tick={{ fontSize: 11 }}
            />
          )}
          {showYAxis && (
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground fill-muted-foreground text-xs"
              tick={{ fontSize: 11 }}
              width={40}
            />
          )}
          <Tooltip
            content={({ active, payload, label }) => (
              <ChartTooltip
                active={active}
                payload={payload as ChartTooltipProps["payload"]}
                label={label as string}
                formatter={tooltipFormatter}
              />
            )}
            cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
          />
          {yKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              radius={barRadius}
              stackId={stacked ? "stack" : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface AreaChartProps extends BaseChartProps {
  curveType?: CurveType;
  strokeWidth?: number;
  fillOpacity?: number;
  stacked?: boolean;
}

function AreaChart({
  data,
  xKey,
  yKey,
  height = 300,
  className,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  tooltipFormatter,
  colors = chartColors,
  curveType = "monotone",
  strokeWidth = 2,
  fillOpacity = 0.3,
  stacked = false,
}: AreaChartProps) {
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          )}
          {showXAxis && (
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground fill-muted-foreground text-xs"
              tick={{ fontSize: 11 }}
            />
          )}
          {showYAxis && (
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground fill-muted-foreground text-xs"
              tick={{ fontSize: 11 }}
              width={40}
            />
          )}
          <Tooltip
            content={({ active, payload, label }) => (
              <ChartTooltip
                active={active}
                payload={payload as ChartTooltipProps["payload"]}
                label={label as string}
                formatter={tooltipFormatter}
              />
            )}
          />
          {yKeys.map((key, index) => (
            <Area
              key={key}
              type={curveType}
              dataKey={key}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              strokeWidth={strokeWidth}
              fillOpacity={fillOpacity}
              stackId={stacked ? "stack" : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Mini sparkline for stat cards (no axes, no grid, minimal)
interface SparklineProps {
  data: Array<Record<string, unknown>>;
  dataKey: string;
  height?: number;
  className?: string;
  color?: string;
  type?: "line" | "area";
}

function Sparkline({
  data,
  dataKey,
  height = 40,
  className,
  color = chartColors[0],
  type = "line",
}: SparklineProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "area" ? (
          <RechartsAreaChart data={data}>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              strokeWidth={1.5}
              fillOpacity={0.2}
              dot={false}
            />
          </RechartsAreaChart>
        ) : (
          <RechartsLineChart data={data}>
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} dot={false} />
          </RechartsLineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

// StatCard with optional sparkline
interface StatCardProps extends React.ComponentProps<"div"> {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  sparklineData?: Array<Record<string, unknown>>;
  sparklineKey?: string;
  icon?: React.ReactNode;
}

function StatCard({
  title,
  value,
  change,
  sparklineData,
  sparklineKey = "value",
  icon,
  className,
  ...props
}: StatCardProps) {
  const changeColor =
    change?.type === "increase"
      ? "text-emerald-500"
      : change?.type === "decrease"
        ? "text-red-500"
        : "text-muted-foreground";

  const changePrefix = change?.type === "increase" ? "+" : "";

  return (
    <div
      data-slot="stat-card"
      className={cn(
        "bg-card text-card-foreground ring-foreground/10 flex flex-col gap-3 rounded-none p-4 ring-1",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">{title}</span>
          <span className="text-foreground text-2xl font-semibold tabular-nums">{value}</span>
        </div>
        {icon && (
          <div className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-full">
            {icon}
          </div>
        )}
      </div>

      {(change || sparklineData) && (
        <div className="flex items-end justify-between gap-4">
          {change && (
            <span className={cn("text-xs font-medium", changeColor)}>
              {changePrefix}
              {change.value}%
            </span>
          )}
          {sparklineData && sparklineData.length > 0 && (
            <Sparkline
              data={sparklineData}
              dataKey={sparklineKey}
              height={32}
              className="flex-1"
              color={
                change?.type === "increase"
                  ? "var(--color-chart-1)"
                  : change?.type === "decrease"
                    ? "var(--color-destructive)"
                    : "var(--color-chart-1)"
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

export { LineChart, BarChart, AreaChart, Sparkline, StatCard, ChartTooltip, chartColors };
