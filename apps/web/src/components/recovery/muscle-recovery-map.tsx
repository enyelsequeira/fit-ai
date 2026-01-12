import { Badge } from "@/components/ui/badge";
import { Card, FitAiCardContent, FitAiCardHeader, FitAiCardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MuscleRecoveryStatus {
  muscleGroup: string;
  recoveryScore: number | null;
  fatigueLevel: number | null;
  lastWorkedAt: Date | null;
  setsLast7Days: number;
  volumeLast7Days: number;
  estimatedFullRecovery: Date | null;
}

interface MuscleRecoveryMapProps {
  muscleGroups: MuscleRecoveryStatus[];
  className?: string;
}

function getRecoveryColor(score: number | null) {
  if (score === null) return { text: "text-muted-foreground", bg: "bg-muted" };
  if (score >= 80) return { text: "text-emerald-500", bg: "bg-emerald-500" };
  if (score >= 60) return { text: "text-green-500", bg: "bg-green-500" };
  if (score >= 40) return { text: "text-amber-500", bg: "bg-amber-500" };
  if (score >= 20) return { text: "text-orange-500", bg: "bg-orange-500" };
  return { text: "text-red-500", bg: "bg-red-500" };
}

function formatTimeAgo(date: Date | null) {
  if (!date) return "Never";

  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "Today";
}

function formatTimeUntil(date: Date | null) {
  if (!date) return "Recovered";

  const now = new Date();
  const diff = new Date(date).getTime() - now.getTime();

  if (diff <= 0) return "Recovered";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return "< 1h";
}

function MuscleRecoveryItem({ muscle }: { muscle: MuscleRecoveryStatus }) {
  const colors = getRecoveryColor(muscle.recoveryScore);
  const score = muscle.recoveryScore ?? 100;

  return (
    <div className="rounded-none border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium capitalize">
          {muscle.muscleGroup.replace("_", " ")}
        </span>
        <Badge variant="outline" className={cn("text-[10px] tabular-nums", colors.text)}>
          {score}%
        </Badge>
      </div>

      <Progress value={score} className="h-1.5" />

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Last: {formatTimeAgo(muscle.lastWorkedAt)}</span>
        <span>{muscle.setsLast7Days} sets / 7d</span>
        {muscle.recoveryScore !== null && muscle.recoveryScore < 100 && (
          <span>Full: {formatTimeUntil(muscle.estimatedFullRecovery)}</span>
        )}
      </div>
    </div>
  );
}

function MuscleRecoveryMap({ muscleGroups, className }: MuscleRecoveryMapProps) {
  // Sort by recovery score (lowest first)
  const sorted = [...muscleGroups].sort((a, b) => {
    const aScore = a.recoveryScore ?? 100;
    const bScore = b.recoveryScore ?? 100;
    return aScore - bScore;
  });

  const overallRecovery = Math.round(
    muscleGroups.reduce((sum, m) => sum + (m.recoveryScore ?? 100), 0) / muscleGroups.length,
  );

  return (
    <Card className={className}>
      <FitAiCardHeader>
        <div className="flex items-center justify-between">
          <FitAiCardTitle className="text-sm">Muscle Recovery Status</FitAiCardTitle>
          <Badge variant="secondary" className="text-xs tabular-nums">
            {overallRecovery}% Overall
          </Badge>
        </div>
      </FitAiCardHeader>
      <FitAiCardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {sorted.map((muscle) => (
            <MuscleRecoveryItem key={muscle.muscleGroup} muscle={muscle} />
          ))}
        </div>
      </FitAiCardContent>
    </Card>
  );
}

export { MuscleRecoveryMap };
export type { MuscleRecoveryStatus };
