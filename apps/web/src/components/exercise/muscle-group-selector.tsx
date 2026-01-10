import { IconX } from "@tabler/icons-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { FitAiButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const muscleGroups = [
  // Chest
  "pectorals",
  // Shoulders
  "anterior deltoids",
  "lateral deltoids",
  "posterior deltoids",
  // Back
  "trapezius",
  "latissimus dorsi",
  "rhomboids",
  "erector spinae",
  // Arms
  "biceps",
  "triceps",
  "forearms",
  // Legs
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "hip flexors",
  // Core
  "rectus abdominis",
  "obliques",
  "transverse abdominis",
] as const;

export type MuscleGroup = (typeof muscleGroups)[number];

interface MuscleGroupSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function MuscleGroupSelector({
  value,
  onChange,
  className,
  placeholder = "Search muscle groups...",
  disabled = false,
}: MuscleGroupSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredGroups = muscleGroups.filter(
    (group) => group.toLowerCase().includes(search.toLowerCase()) && !value.includes(group),
  );

  const handleSelect = (group: string) => {
    onChange([...value, group]);
    setSearch("");
  };

  const handleRemove = (group: string) => {
    onChange(value.filter((v) => v !== group));
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "dark:bg-input/30 border-input focus-within:border-ring focus-within:ring-ring/50 flex min-h-8 w-full flex-wrap items-center gap-1 rounded-none border bg-transparent px-2 py-1 text-xs transition-colors focus-within:ring-1",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {value.map((group) => (
          <Badge key={group} variant="secondary" className="gap-1 px-1.5 py-0 text-[10px]">
            {group}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(group)}
                className="hover:bg-muted rounded-sm"
              >
                <IconX className="size-3" />
              </button>
            )}
          </Badge>
        ))}
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="h-6 min-w-20 flex-1 border-0 bg-transparent p-0 focus-visible:ring-0"
        />
      </div>

      {isOpen && filteredGroups.length > 0 && (
        <div className="ring-foreground/10 bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-none shadow-md ring-1">
          <div className="p-1">
            {filteredGroups.map((group) => (
              <FitAiButton
                key={group}
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs font-normal"
                onClick={() => handleSelect(group)}
              >
                {group}
              </FitAiButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MuscleGroupTagsProps {
  muscles: string[];
  maxVisible?: number;
  size?: "sm" | "default";
  className?: string;
}

export function MuscleGroupTags({
  muscles,
  maxVisible = 3,
  size = "default",
  className,
}: MuscleGroupTagsProps) {
  const visible = muscles.slice(0, maxVisible);
  const remaining = muscles.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {visible.map((muscle) => (
        <Badge
          key={muscle}
          variant="outline"
          className={cn("text-muted-foreground", size === "sm" && "px-1 py-0 text-[10px]")}
        >
          {muscle}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge
          variant="outline"
          className={cn("text-muted-foreground", size === "sm" && "px-1 py-0 text-[10px]")}
        >
          +{remaining} more
        </Badge>
      )}
    </div>
  );
}
