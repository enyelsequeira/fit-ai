import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Mood = "great" | "good" | "neutral" | "low" | "bad";

interface CheckInData {
  id: number;
  date: string;
  sleepHours: number | null;
  sleepQuality: number | null;
  energyLevel: number | null;
  stressLevel: number | null;
  sorenessLevel: number | null;
  soreAreas: string[] | null;
  restingHeartRate: number | null;
  hrvScore: number | null;
  motivationLevel: number | null;
  mood: Mood | null;
  nutritionQuality: number | null;
  hydrationLevel: number | null;
  notes: string | null;
}

interface CheckInSummaryProps {
  checkIn: CheckInData;
  onEdit?: () => void;
  className?: string;
}

const MOOD_EMOJI: Record<Mood, string> = {
  great: "Great",
  good: "Good",
  neutral: "Neutral",
  low: "Low",
  bad: "Bad",
};

function StatItem({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number | null;
  max: number;
  color?: string;
}) {
  if (value === null) return null;

  const percentage = (value / max) * 100;
  const getColor = () => {
    if (color) return color;
    if (label.toLowerCase().includes("stress") || label.toLowerCase().includes("soreness")) {
      // Inverse: lower is better
      if (value <= 3) return "bg-emerald-500";
      if (value <= 6) return "bg-amber-500";
      return "bg-red-500";
    }
    // Higher is better
    if (percentage >= 70) return "bg-emerald-500";
    if (percentage >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {value}/{max}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function CheckInSummary({ checkIn, onEdit, className }: CheckInSummaryProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{formatDate(checkIn.date)}</CardTitle>
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood & Overview */}
        <div className="flex items-center gap-4">
          {checkIn.mood && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">{MOOD_EMOJI[checkIn.mood]}</span>
              <span className="text-xs text-muted-foreground capitalize">{checkIn.mood}</span>
            </div>
          )}
          {checkIn.sleepHours !== null && (
            <div className="flex flex-col items-center gap-1 border-l pl-4">
              <span className="text-lg font-semibold tabular-nums">{checkIn.sleepHours}h</span>
              <span className="text-xs text-muted-foreground">Sleep</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-3">
          <StatItem label="Sleep Quality" value={checkIn.sleepQuality} max={5} />
          <StatItem label="Energy" value={checkIn.energyLevel} max={10} />
          <StatItem label="Motivation" value={checkIn.motivationLevel} max={10} />
          <StatItem label="Stress" value={checkIn.stressLevel} max={10} />
          <StatItem label="Soreness" value={checkIn.sorenessLevel} max={10} />
          <StatItem label="Nutrition" value={checkIn.nutritionQuality} max={5} />
          <StatItem label="Hydration" value={checkIn.hydrationLevel} max={5} />
        </div>

        {/* Sore Areas */}
        {checkIn.soreAreas && checkIn.soreAreas.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Sore Areas</span>
            <div className="flex flex-wrap gap-1">
              {checkIn.soreAreas.map((area) => (
                <Badge key={area} variant="destructive" className="text-[10px] capitalize">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Metrics */}
        {(checkIn.restingHeartRate || checkIn.hrvScore) && (
          <div className="flex gap-4 border-t pt-4">
            {checkIn.restingHeartRate && (
              <div className="flex flex-col">
                <span className="text-sm font-medium tabular-nums">
                  {checkIn.restingHeartRate} BPM
                </span>
                <span className="text-xs text-muted-foreground">Resting HR</span>
              </div>
            )}
            {checkIn.hrvScore && (
              <div className="flex flex-col">
                <span className="text-sm font-medium tabular-nums">{checkIn.hrvScore}</span>
                <span className="text-xs text-muted-foreground">HRV</span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {checkIn.notes && (
          <div className="border-t pt-4">
            <span className="text-xs text-muted-foreground">Notes</span>
            <p className="mt-1 text-sm">{checkIn.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { CheckInSummary };
export type { CheckInData as CheckInSummaryData };
