import type { CurveType } from "recharts/types/shape/Curve";

import { Box, Group, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
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

// Chart color palette
const chartColors = [
  "var(--mantine-color-blue-5)",
  "var(--mantine-color-cyan-5)",
  "var(--mantine-color-teal-5)",
  "var(--mantine-color-grape-5)",
  "var(--mantine-color-pink-5)",
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
    <Paper p="xs" shadow="sm" withBorder>
      {label && (
        <Text size="xs" c="dimmed" mb="xs" fw={500}>
          {label}
        </Text>
      )}
      <Stack gap={4}>
        {payload.map((entry, index) => (
          <Group key={index} gap="xs">
            <Box w={8} h={8} style={{ backgroundColor: entry.color, borderRadius: "50%" }} />
            <Text size="xs" c="dimmed">
              {entry.name}:
            </Text>
            <Text size="xs" fw={500}>
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </Text>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}

interface BaseChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string | string[];
  height?: number;
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
    <Box w="100%" h={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--mantine-color-dark-4)"
              vertical={false}
            />
          )}
          {showXAxis && (
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }}
            />
          )}
          {showYAxis && (
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }}
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
    </Box>
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
    <Box w="100%" h={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--mantine-color-dark-4)"
              vertical={false}
            />
          )}
          {showXAxis && (
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }}
            />
          )}
          {showYAxis && (
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }}
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
            cursor={{ fill: "var(--mantine-color-dark-6)", opacity: 0.3 }}
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
    </Box>
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
    <Box w="100%" h={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--mantine-color-dark-4)"
              vertical={false}
            />
          )}
          {showXAxis && (
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }}
            />
          )}
          {showYAxis && (
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--mantine-color-dimmed)" }}
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
    </Box>
  );
}

// Mini sparkline for stat cards (no axes, no grid, minimal)
interface SparklineProps {
  data: Array<Record<string, unknown>>;
  dataKey: string;
  height?: number;
  color?: string;
  type?: "line" | "area";
}

function Sparkline({
  data,
  dataKey,
  height = 40,
  color = chartColors[0],
  type = "line",
}: SparklineProps) {
  return (
    <Box w="100%" h={height}>
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
    </Box>
  );
}

// StatCard with optional sparkline
interface StatCardProps {
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
}: StatCardProps) {
  const changeColor =
    change?.type === "increase" ? "green" : change?.type === "decrease" ? "red" : "dimmed";

  const changePrefix = change?.type === "increase" ? "+" : "";

  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              {title}
            </Text>
            <Title order={3} style={{ fontVariantNumeric: "tabular-nums" }}>
              {value}
            </Title>
          </Stack>
          {icon && (
            <ThemeIcon size="lg" radius="xl" variant="light" color="gray">
              {icon}
            </ThemeIcon>
          )}
        </Group>

        {(change || sparklineData) && (
          <Group justify="space-between" align="flex-end" gap="md">
            {change && (
              <Text size="xs" fw={500} c={changeColor}>
                {changePrefix}
                {change.value}%
              </Text>
            )}
            {sparklineData && sparklineData.length > 0 && (
              <Box style={{ flex: 1 }}>
                <Sparkline
                  data={sparklineData}
                  dataKey={sparklineKey}
                  height={32}
                  color={
                    change?.type === "increase"
                      ? "var(--mantine-color-green-5)"
                      : change?.type === "decrease"
                        ? "var(--mantine-color-red-5)"
                        : "var(--mantine-color-blue-5)"
                  }
                />
              </Box>
            )}
          </Group>
        )}
      </Stack>
    </Paper>
  );
}

export { LineChart, BarChart, AreaChart, Sparkline, StatCard, ChartTooltip, chartColors };
