import { Badge } from "@mantine/core";

export type ExerciseLevel = "beginner" | "intermediate" | "expert";
export type ExerciseForce = "push" | "pull" | "static";
export type ExerciseMechanic = "compound" | "isolation";

const levelColors: Record<ExerciseLevel, string> = {
  beginner: "green",
  intermediate: "yellow",
  expert: "red",
};

interface ExerciseLevelBadgeProps {
  level: ExerciseLevel | null | undefined;
  size?: "sm" | "default";
}

export function ExerciseLevelBadge({ level, size }: ExerciseLevelBadgeProps) {
  if (!level) return null;

  return (
    <Badge
      variant="light"
      color={levelColors[level]}
      size={size === "sm" ? "xs" : "sm"}
      tt="capitalize"
    >
      {level}
    </Badge>
  );
}

const forceColors: Record<ExerciseForce, string> = {
  push: "blue",
  pull: "violet",
  static: "gray",
};

interface ExerciseForceBadgeProps {
  force: ExerciseForce | null | undefined;
  size?: "sm" | "default";
}

export function ExerciseForceBadge({ force, size }: ExerciseForceBadgeProps) {
  if (!force) return null;

  return (
    <Badge
      variant="light"
      color={forceColors[force]}
      size={size === "sm" ? "xs" : "sm"}
      tt="capitalize"
    >
      {force}
    </Badge>
  );
}

const mechanicColors: Record<ExerciseMechanic, string> = {
  compound: "orange",
  isolation: "cyan",
};

interface ExerciseMechanicBadgeProps {
  mechanic: ExerciseMechanic | null | undefined;
  size?: "sm" | "default";
}

export function ExerciseMechanicBadge({ mechanic, size }: ExerciseMechanicBadgeProps) {
  if (!mechanic) return null;

  return (
    <Badge
      variant="light"
      color={mechanicColors[mechanic]}
      size={size === "sm" ? "xs" : "sm"}
      tt="capitalize"
    >
      {mechanic}
    </Badge>
  );
}
