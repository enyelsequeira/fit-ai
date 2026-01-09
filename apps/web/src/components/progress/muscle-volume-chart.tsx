import { IconActivity } from "@tabler/icons-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { EmptyState } from "@/components/ui/empty-state";

const MUSCLE_COLORS: Record<string, string> = {
  chest: "#ef4444",
  back: "#f97316",
  shoulders: "#eab308",
  arms: "#22c55e",
  legs: "#06b6d4",
  core: "#8b5cf6",
  compound: "#ec4899",
  cardio: "#64748b",
  other: "#94a3b8",
};

interface MuscleVolumeData {
  name: string;
  value: number;
  color: string;
}

interface MuscleVolumeChartProps {
  data: Record<string, number>;
  size?: number;
}

export function MuscleVolumeChart({ data, size = 200 }: MuscleVolumeChartProps) {
  const chartData: MuscleVolumeData[] = Object.entries(data).map(([muscle, volume]) => ({
    name: muscle.charAt(0).toUpperCase() + muscle.slice(1),
    value: volume,
    color: MUSCLE_COLORS[muscle] ?? MUSCLE_COLORS.other,
  }));

  if (chartData.length === 0) {
    return (
      <EmptyState
        icon={IconActivity}
        title="No muscle data"
        description="Complete workouts to see muscle breakdown"
      />
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={size * 0.2}
              outerRadius={size * 0.35}
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value.toLocaleString()}kg`, "Volume"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-1">
        {chartData.slice(0, 6).map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="font-medium">{item.value.toLocaleString()}kg</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { MUSCLE_COLORS };
