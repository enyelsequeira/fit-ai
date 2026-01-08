import { ClipboardCheck, Moon, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CheckIn {
  id: number;
  date: string;
  sleepHours: number | null;
  sleepQuality: number | null;
  energyLevel: number | null;
  stressLevel: number | null;
  sorenessLevel: number | null;
  mood: string | null;
}

interface ReadinessData {
  score: number;
  recommendation: string;
  factors: {
    sleepScore: number | null;
    energyScore: number | null;
    sorenessScore: number | null;
    stressScore: number | null;
    muscleRecoveryScore: number | null;
  };
  todayCheckIn: boolean;
  lastCheckInDate: string | null;
}

interface RecoveryStatusProps {
  readiness: ReadinessData | null;
  todayCheckIn: CheckIn | null;
  isLoading?: boolean;
  onLogCheckIn?: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-500";
  if (score >= 40) return "text-yellow-500";
  return "text-red-500";
}

function getScoreBgColor(score: number): string {
  if (score >= 70) return "bg-green-500/10";
  if (score >= 40) return "bg-yellow-500/10";
  return "bg-red-500/10";
}

function getMoodEmoji(mood: string | null): string {
  const moods: Record<string, string> = {
    great: "Feeling Great",
    good: "Feeling Good",
    neutral: "Okay",
    low: "Feeling Low",
    bad: "Not Good",
  };
  return mood ? (moods[mood] ?? mood) : "-";
}

function FactorBar({ label, score }: { label: string; score: number | null }) {
  if (score === null) return null;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span>{score}%</span>
      </div>
      <div className="bg-muted h-1.5 w-full rounded-full">
        <div
          className={cn(
            "h-1.5 rounded-full transition-all",
            score >= 70 && "bg-green-500",
            score >= 40 && score < 70 && "bg-yellow-500",
            score < 40 && "bg-red-500",
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function RecoveryStatus({
  readiness,
  todayCheckIn,
  isLoading,
  onLogCheckIn,
}: RecoveryStatusProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recovery Status</CardTitle>
          <CardDescription>Your training readiness</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-1.5 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No check-in logged today
  if (!readiness?.todayCheckIn && !todayCheckIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recovery Status</CardTitle>
          <CardDescription>Your training readiness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <ClipboardCheck className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <p className="mb-2 font-medium">How are you feeling today?</p>
            <p className="text-muted-foreground mb-4 text-sm">
              Log your daily check-in to track recovery
            </p>
            <Button onClick={onLogCheckIn}>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Log Check-in
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recovery Status</CardTitle>
        <CardDescription>Your training readiness</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Readiness Score */}
        {readiness && (
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full",
                getScoreBgColor(readiness.score),
                getScoreColor(readiness.score),
              )}
            >
              <div className="text-center">
                <span className="text-2xl font-bold">{readiness.score}</span>
              </div>
            </div>
            <div>
              <p className={cn("font-semibold", getScoreColor(readiness.score))}>
                {readiness.recommendation}
              </p>
              <p className="text-muted-foreground text-sm">Training Readiness Score</p>
            </div>
          </div>
        )}

        {/* Factor Breakdown */}
        {readiness?.factors && (
          <div className="space-y-2">
            <FactorBar label="Sleep" score={readiness.factors.sleepScore} />
            <FactorBar label="Energy" score={readiness.factors.energyScore} />
            <FactorBar label="Recovery" score={readiness.factors.sorenessScore} />
            <FactorBar label="Stress" score={readiness.factors.stressScore} />
            <FactorBar label="Muscles" score={readiness.factors.muscleRecoveryScore} />
          </div>
        )}

        {/* Today's Check-in Summary */}
        {todayCheckIn && (
          <div className="border-t pt-4">
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">
              Today's Check-in
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {todayCheckIn.sleepHours && (
                <div className="flex items-center gap-2">
                  <Moon className="text-muted-foreground h-4 w-4" />
                  <span>{todayCheckIn.sleepHours}h sleep</span>
                </div>
              )}
              {todayCheckIn.energyLevel && (
                <div className="flex items-center gap-2">
                  <Zap className="text-muted-foreground h-4 w-4" />
                  <span>Energy: {todayCheckIn.energyLevel}/10</span>
                </div>
              )}
              {todayCheckIn.mood && (
                <div className="col-span-2 text-muted-foreground">
                  {getMoodEmoji(todayCheckIn.mood)}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecoveryStatusSkeleton() {
  return <RecoveryStatus readiness={null} todayCheckIn={null} isLoading={true} />;
}
