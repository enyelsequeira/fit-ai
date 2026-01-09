import { IconChartBar } from "@tabler/icons-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/ui/empty-state";

interface VolumeDataPoint {
  week: string;
  volume: number;
}

interface VolumeChartProps {
  data: VolumeDataPoint[];
  height?: number;
}

export function VolumeChart({ data, height = 256 }: VolumeChartProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={IconChartBar}
        title="No volume data"
        description="Complete workouts to track your volume"
      />
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="week" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={50}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
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
                return [`${value.toLocaleString()}kg`, "Volume"];
              }
              return [String(value), "Volume"];
            }}
          />
          <Bar dataKey="volume" fill="hsl(var(--primary))" radius={0} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
