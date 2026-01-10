import type { TablerIcon } from "@tabler/icons-react";

import { IconActivity, IconBed, IconSalad, IconCalendar, IconX } from "@tabler/icons-react";

import { FitAiButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RecommendationType = "training" | "recovery" | "nutrition" | "schedule";
type Priority = "high" | "medium" | "low";

interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  priority: Priority;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDismiss?: () => void;
  className?: string;
}

const typeConfig: Record<RecommendationType, { icon: TablerIcon; color: string }> = {
  training: { icon: IconActivity, color: "text-blue-500 bg-blue-500/10" },
  recovery: { icon: IconBed, color: "text-purple-500 bg-purple-500/10" },
  nutrition: { icon: IconSalad, color: "text-green-500 bg-green-500/10" },
  schedule: { icon: IconCalendar, color: "text-amber-500 bg-amber-500/10" },
};

const priorityConfig: Record<Priority, { border: string; badge: string }> = {
  high: { border: "border-l-red-500", badge: "bg-red-500/10 text-red-500" },
  medium: { border: "border-l-amber-500", badge: "bg-amber-500/10 text-amber-500" },
  low: { border: "border-l-blue-500", badge: "bg-blue-500/10 text-blue-500" },
};

function RecommendationCard({ recommendation, onDismiss, className }: RecommendationCardProps) {
  const { type, title, description, priority } = recommendation;
  const { icon: Icon, color } = typeConfig[type];
  const { border, badge } = priorityConfig[priority];

  return (
    <Card className={cn("border-l-4", border, className)}>
      <CardContent className="flex items-start gap-3 py-3">
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", color)}>
          <Icon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium truncate">{title}</h4>
            <span
              className={cn(
                "shrink-0 rounded-none px-1.5 py-0.5 text-[10px] font-medium uppercase",
                badge,
              )}
            >
              {priority}
            </span>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs line-clamp-2">{description}</p>
        </div>
        {onDismiss && (
          <FitAiButton variant="ghost" size="icon-xs" onClick={onDismiss} className="shrink-0">
            <IconX className="size-3" />
          </FitAiButton>
        )}
      </CardContent>
    </Card>
  );
}

export { RecommendationCard };
export type { Recommendation, RecommendationType, Priority };
