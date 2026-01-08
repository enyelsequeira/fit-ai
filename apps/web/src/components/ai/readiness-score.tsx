import { cn } from "@/lib/utils";

interface ReadinessScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showRecommendation?: boolean;
  recommendation?: string;
  className?: string;
}

function getScoreColor(score: number) {
  if (score >= 70)
    return { ring: "stroke-emerald-500", text: "text-emerald-500", bg: "bg-emerald-500/10" };
  if (score >= 40)
    return { ring: "stroke-amber-500", text: "text-amber-500", bg: "bg-amber-500/10" };
  return { ring: "stroke-red-500", text: "text-red-500", bg: "bg-red-500/10" };
}

function getDefaultRecommendation(score: number) {
  if (score >= 70) return "Ready for hard training!";
  if (score >= 40) return "Light training recommended";
  return "Rest day suggested";
}

function ReadinessScore({
  score,
  size = "md",
  showRecommendation = true,
  recommendation,
  className,
}: ReadinessScoreProps) {
  const colors = getScoreColor(score);
  const displayRecommendation = recommendation ?? getDefaultRecommendation(score);

  const sizeConfig = {
    sm: { svg: 80, stroke: 6, fontSize: "text-lg", labelSize: "text-xs" },
    md: { svg: 120, stroke: 8, fontSize: "text-2xl", labelSize: "text-sm" },
    lg: { svg: 160, stroke: 10, fontSize: "text-4xl", labelSize: "text-base" },
  };

  const config = sizeConfig[size];
  const radius = (config.svg - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <svg
          width={config.svg}
          height={config.svg}
          viewBox={`0 0 ${config.svg} ${config.svg}`}
          className="rotate-[-90deg]"
        >
          <circle
            cx={config.svg / 2}
            cy={config.svg / 2}
            r={radius}
            fill="none"
            strokeWidth={config.stroke}
            className="stroke-secondary"
          />
          <circle
            cx={config.svg / 2}
            cy={config.svg / 2}
            r={radius}
            fill="none"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(colors.ring, "transition-all duration-500 ease-out")}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(config.fontSize, "font-bold tabular-nums", colors.text)}>
            {score}
          </span>
          <span className={cn(config.labelSize, "text-muted-foreground")}>/ 100</span>
        </div>
      </div>
      {showRecommendation && (
        <div
          className={cn(
            "rounded-none px-3 py-1.5 text-center text-xs font-medium",
            colors.bg,
            colors.text,
          )}
        >
          {displayRecommendation}
        </div>
      )}
    </div>
  );
}

interface FactorsBreakdownProps {
  factors: {
    sleepScore: number | null;
    energyScore: number | null;
    sorenessScore: number | null;
    stressScore: number | null;
    muscleRecoveryScore: number | null;
  };
  className?: string;
}

function FactorsBreakdown({ factors, className }: FactorsBreakdownProps) {
  const items = [
    { label: "Sleep", value: factors.sleepScore, icon: "sleep" },
    { label: "Energy", value: factors.energyScore, icon: "energy" },
    { label: "Soreness", value: factors.sorenessScore, icon: "soreness" },
    { label: "Stress", value: factors.stressScore, icon: "stress" },
    { label: "Muscle Recovery", value: factors.muscleRecoveryScore, icon: "muscle" },
  ];

  return (
    <div className={cn("grid grid-cols-5 gap-2", className)}>
      {items.map((item) => {
        const value = item.value ?? 0;
        const colors = getScoreColor(value);

        return (
          <div key={item.label} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
                colors.bg,
                colors.text,
              )}
            >
              {item.value !== null ? value : "-"}
            </div>
            <span className="text-muted-foreground text-[10px] text-center leading-tight">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export { ReadinessScore, FactorsBreakdown, getScoreColor, getDefaultRecommendation };
