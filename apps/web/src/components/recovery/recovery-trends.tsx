import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TrendsData {
  period: string;
  dataPoints: number;
  averages: {
    sleepHours: number | null;
    sleepQuality: number | null;
    energyLevel: number | null;
    stressLevel: number | null;
    sorenessLevel: number | null;
    motivationLevel: number | null;
    nutritionQuality: number | null;
    hydrationLevel: number | null;
  };
  moodDistribution: {
    great: number;
    good: number;
    neutral: number;
    low: number;
    bad: number;
  };
}

interface RecoveryTrendsProps {
  trends: TrendsData;
  className?: string;
}

function StatCard({
  label,
  value,
  max,
  unit,
  inverse = false,
}: {
  label: string;
  value: number | null;
  max: number;
  unit?: string;
  inverse?: boolean;
}) {
  if (value === null) return null;

  const percentage = (value / max) * 100;
  const getColor = () => {
    if (inverse) {
      if (value <= max * 0.3) return "text-emerald-500";
      if (value <= max * 0.6) return "text-amber-500";
      return "text-red-500";
    }
    if (percentage >= 70) return "text-emerald-500";
    if (percentage >= 40) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="flex flex-col items-center p-3 rounded-none border">
      <span className={cn("text-xl font-bold tabular-nums", getColor())}>
        {value.toFixed(1)}
        {unit && <span className="text-xs font-normal">{unit}</span>}
      </span>
      <span className="text-[10px] text-muted-foreground text-center">{label}</span>
    </div>
  );
}

function MoodBar({
  moodDistribution,
  total,
}: {
  moodDistribution: TrendsData["moodDistribution"];
  total: number;
}) {
  if (total === 0) return null;

  const items = [
    { key: "great", color: "bg-emerald-500", count: moodDistribution.great },
    { key: "good", color: "bg-green-500", count: moodDistribution.good },
    { key: "neutral", color: "bg-amber-500", count: moodDistribution.neutral },
    { key: "low", color: "bg-orange-500", count: moodDistribution.low },
    { key: "bad", color: "bg-red-500", count: moodDistribution.bad },
  ];

  return (
    <div className="space-y-2">
      <span className="text-xs text-muted-foreground">Mood Distribution</span>
      <div className="flex h-3 w-full overflow-hidden rounded-none">
        {items.map((item) => {
          const width = (item.count / total) * 100;
          if (width === 0) return null;
          return (
            <div
              key={item.key}
              className={cn(item.color, "h-full transition-all")}
              style={{ width: `${width}%` }}
              title={`${item.key}: ${item.count}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-1">
            <div className={cn("size-2 rounded-full", item.color)} />
            <span className="capitalize">{item.key}</span>
            <span className="tabular-nums">({item.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecoveryTrends({ trends, className }: RecoveryTrendsProps) {
  const totalMoods = Object.values(trends.moodDistribution).reduce((a, b) => a + b, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Trends ({trends.period})</CardTitle>
          <span className="text-xs text-muted-foreground">{trends.dataPoints} check-ins</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average Stats */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard label="Avg Sleep" value={trends.averages.sleepHours} max={10} unit="h" />
          <StatCard label="Sleep Quality" value={trends.averages.sleepQuality} max={5} />
          <StatCard label="Avg Energy" value={trends.averages.energyLevel} max={10} />
          <StatCard label="Avg Motivation" value={trends.averages.motivationLevel} max={10} />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <StatCard label="Avg Stress" value={trends.averages.stressLevel} max={10} inverse />
          <StatCard label="Avg Soreness" value={trends.averages.sorenessLevel} max={10} inverse />
          <StatCard label="Nutrition" value={trends.averages.nutritionQuality} max={5} />
          <StatCard label="Hydration" value={trends.averages.hydrationLevel} max={5} />
        </div>

        {/* Mood Distribution */}
        <MoodBar moodDistribution={trends.moodDistribution} total={totalMoods} />
      </CardContent>
    </Card>
  );
}

export { RecoveryTrends };
export type { TrendsData };
