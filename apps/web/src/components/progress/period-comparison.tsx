import { BarChart3Icon } from "lucide-react";

import { cn } from "@/lib/utils";

import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PeriodData {
  workouts: number;
  volume: number;
  prs: number;
  avgDuration: number;
}

interface ComparisonData {
  period1: PeriodData;
  period2: PeriodData;
}

interface PeriodComparisonProps {
  data: ComparisonData | null;
  period1Start: string;
  period1End: string;
  period2Start: string;
  period2End: string;
  onPeriod1StartChange: (value: string) => void;
  onPeriod1EndChange: (value: string) => void;
  onPeriod2StartChange: (value: string) => void;
  onPeriod2EndChange: (value: string) => void;
}

export function PeriodComparison({
  data,
  period1Start,
  period1End,
  period2Start,
  period2End,
  onPeriod1StartChange,
  onPeriod1EndChange,
  onPeriod2StartChange,
  onPeriod2EndChange,
}: PeriodComparisonProps) {
  const metrics = data
    ? [
        { label: "Workouts", p1: data.period1.workouts, p2: data.period2.workouts },
        { label: "Total Volume (kg)", p1: data.period1.volume, p2: data.period2.volume },
        { label: "PRs Achieved", p1: data.period1.prs, p2: data.period2.prs },
        {
          label: "Avg Duration (min)",
          p1: data.period1.avgDuration,
          p2: data.period2.avgDuration,
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 rounded-none border border-border/50 p-3">
          <Label className="text-xs text-muted-foreground">Period 1</Label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={period1Start}
              onChange={(e) => onPeriod1StartChange(e.target.value)}
              className="flex-1"
            />
            <span className="flex items-center text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={period1End}
              onChange={(e) => onPeriod1EndChange(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        <div className="space-y-2 rounded-none border border-border/50 p-3">
          <Label className="text-xs text-muted-foreground">Period 2</Label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={period2Start}
              onChange={(e) => onPeriod2StartChange(e.target.value)}
              className="flex-1"
            />
            <span className="flex items-center text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={period2End}
              onChange={(e) => onPeriod2EndChange(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const change = metric.p1 > 0 ? ((metric.p2 - metric.p1) / metric.p1) * 100 : 0;
            const isPositive = change > 0;

            return (
              <div
                key={metric.label}
                className="rounded-none border border-border/50 p-3 text-center"
              >
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <div className="mt-2 flex items-center justify-center gap-4">
                  <div>
                    <p className="text-lg font-bold">
                      {typeof metric.p1 === "number" ? metric.p1.toLocaleString() : metric.p1}
                    </p>
                    <p className="text-xs text-muted-foreground">Period 1</p>
                  </div>
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isPositive
                        ? "text-emerald-500"
                        : change < 0
                          ? "text-red-500"
                          : "text-muted-foreground",
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {change.toFixed(0)}%
                  </div>
                  <div>
                    <p className="text-lg font-bold">
                      {typeof metric.p2 === "number" ? metric.p2.toLocaleString() : metric.p2}
                    </p>
                    <p className="text-xs text-muted-foreground">Period 2</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BarChart3Icon}
          title="No comparison data"
          description="Need at least 2 weeks of data for comparison"
        />
      )}
    </div>
  );
}
