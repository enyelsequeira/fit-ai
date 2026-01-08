import { TrendingUpIcon } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/ui/empty-state";

interface StrengthDataPoint {
  date: string;
  oneRM: number;
  maxWeight: number;
}

interface StrengthChartProps {
  data: StrengthDataPoint[];
  height?: number;
}

export function StrengthChart({ data, height = 256 }: StrengthChartProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={TrendingUpIcon}
        title="No strength data"
        description="Complete more workouts to track progression"
      />
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="oneRM"
            name="Est. 1RM"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="maxWeight"
            name="Max Weight"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
