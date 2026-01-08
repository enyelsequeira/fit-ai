import type { VariantProps } from "class-variance-authority";

import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

export type ExerciseLevel = "beginner" | "intermediate" | "expert";
export type ExerciseForce = "push" | "pull" | "static";
export type ExerciseMechanic = "compound" | "isolation";

const levelBadgeVariants = cva(
  "inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium capitalize",
  {
    variants: {
      level: {
        beginner: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
        intermediate: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
        expert: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
      },
      size: {
        sm: "text-[10px] px-1 py-0",
        default: "text-xs px-1.5 py-0.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface ExerciseLevelBadgeProps extends VariantProps<typeof levelBadgeVariants> {
  level: ExerciseLevel | null | undefined;
  className?: string;
}

export function ExerciseLevelBadge({ level, size, className }: ExerciseLevelBadgeProps) {
  if (!level) return null;

  return <span className={cn(levelBadgeVariants({ level, size }), className)}>{level}</span>;
}

const forceBadgeVariants = cva(
  "inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium capitalize",
  {
    variants: {
      force: {
        push: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
        pull: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
        static: "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400",
      },
      size: {
        sm: "text-[10px] px-1 py-0",
        default: "text-xs px-1.5 py-0.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface ExerciseForceBadgeProps extends VariantProps<typeof forceBadgeVariants> {
  force: ExerciseForce | null | undefined;
  className?: string;
}

export function ExerciseForceBadge({ force, size, className }: ExerciseForceBadgeProps) {
  if (!force) return null;

  return <span className={cn(forceBadgeVariants({ force, size }), className)}>{force}</span>;
}

const mechanicBadgeVariants = cva(
  "inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium capitalize",
  {
    variants: {
      mechanic: {
        compound: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
        isolation: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
      },
      size: {
        sm: "text-[10px] px-1 py-0",
        default: "text-xs px-1.5 py-0.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface ExerciseMechanicBadgeProps extends VariantProps<typeof mechanicBadgeVariants> {
  mechanic: ExerciseMechanic | null | undefined;
  className?: string;
}

export function ExerciseMechanicBadge({ mechanic, size, className }: ExerciseMechanicBadgeProps) {
  if (!mechanic) return null;

  return (
    <span className={cn(mechanicBadgeVariants({ mechanic, size }), className)}>{mechanic}</span>
  );
}
