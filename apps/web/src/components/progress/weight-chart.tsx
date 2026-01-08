import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/ui/empty-state";
import { ScaleIcon } from "lucide-react";

interface WeightDataPoint {
  date: string;
  weight: number;
}

interface WeightChartProps {
  data: WeightDataPoint[];
  goalWeight?: number | null;
  height?: number;
}

export function WeightChart({ data, goalWeight, height = 256 }: WeightChartProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={ScaleIcon}
        title="No weight data"
        description="Track your first measurement to see progress"
      />
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis
            domain={["dataMin - 2", "dataMax + 2"]}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0",
              fontSize: "12px",
            }}
            formatter={(value) => {
              if (typeof value === "number") {
                return [`${value.toFixed(1)}kg`, "Weight"];
              }
              return [String(value), "Weight"];
            }}
          />
          {goalWeight && (
            <ReferenceLine
              y={goalWeight}
              stroke="hsl(142 76% 36%)"
              strokeDasharray="5 5"
              label={{
                value: `Goal: ${goalWeight}kg`,
                position: "right",
                fontSize: 10,
                fill: "hsl(142 76% 36%)",
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="weight"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
