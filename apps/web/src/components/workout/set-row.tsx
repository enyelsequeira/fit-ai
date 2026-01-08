import { Check, Minus, Plus, Trash2 } from "lucide-react";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SetType = "normal" | "warmup" | "failure" | "drop";

interface SetRowProps {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  setType: SetType;
  isCompleted: boolean;
  previousWeight?: number | null;
  previousReps?: number | null;
  weightUnit?: "kg" | "lb";
  onWeightChange: (value: number | null) => void;
  onRepsChange: (value: number | null) => void;
  onRpeChange: (value: number | null) => void;
  onSetTypeChange: (value: SetType) => void;
  onComplete: () => void;
  onDelete: () => void;
  disabled?: boolean;
  className?: string;
}

const SET_TYPE_LABELS: Record<SetType, string> = {
  normal: "Working",
  warmup: "Warmup",
  failure: "Failure",
  drop: "Drop",
};

const SET_TYPE_COLORS: Record<SetType, string> = {
  normal: "",
  warmup: "text-yellow-500",
  failure: "text-red-500",
  drop: "text-blue-500",
};

function SetRow({
  setNumber,
  weight,
  reps,
  rpe,
  setType,
  isCompleted,
  previousWeight,
  previousReps,
  weightUnit = "kg",
  onWeightChange,
  onRepsChange,
  onRpeChange,
  onSetTypeChange,
  onComplete,
  onDelete,
  disabled = false,
  className,
}: SetRowProps) {
  const showRpe = rpe !== null;

  const handleWeightIncrement = useCallback(
    (increment: number) => {
      const newWeight = (weight ?? 0) + increment;
      onWeightChange(Math.max(0, newWeight));
    },
    [weight, onWeightChange],
  );

  const handleRepsIncrement = useCallback(
    (increment: number) => {
      const newReps = (reps ?? 0) + increment;
      onRepsChange(Math.max(0, newReps));
    },
    [reps, onRepsChange],
  );

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-2 py-2 px-1",
        "border-b border-border/50 last:border-b-0",
        isCompleted && "opacity-60",
        className,
      )}
    >
      {/* Set number / type */}
      <div className="flex items-center gap-1 min-w-[60px]">
        <Select
          value={setType}
          onValueChange={(value) => onSetTypeChange(value as SetType)}
          disabled={disabled || isCompleted}
        >
          <SelectTrigger className={cn("h-7 w-16 text-xs px-1.5", SET_TYPE_COLORS[setType])}>
            <span className="truncate">
              {setType === "normal" ? setNumber : SET_TYPE_LABELS[setType].charAt(0)}
            </span>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SET_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Previous performance hint */}
      <div className="text-muted-foreground text-xs text-center min-w-[70px]">
        {previousWeight && previousReps ? (
          <span>
            {previousWeight}
            {weightUnit} x {previousReps}
          </span>
        ) : (
          <span className="opacity-50">-</span>
        )}
      </div>

      {/* Weight input */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => handleWeightIncrement(-2.5)}
          disabled={disabled || isCompleted}
          aria-label="Decrease weight"
        >
          <Minus className="size-3" />
        </Button>
        <Input
          type="number"
          value={weight ?? ""}
          onChange={(e) => onWeightChange(e.target.value ? Number(e.target.value) : null)}
          disabled={disabled || isCompleted}
          className="h-7 w-16 text-center text-xs px-1"
          placeholder={weightUnit}
        />
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => handleWeightIncrement(2.5)}
          disabled={disabled || isCompleted}
          aria-label="Increase weight"
        >
          <Plus className="size-3" />
        </Button>
      </div>

      {/* Reps input */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => handleRepsIncrement(-1)}
          disabled={disabled || isCompleted}
          aria-label="Decrease reps"
        >
          <Minus className="size-3" />
        </Button>
        <Input
          type="number"
          value={reps ?? ""}
          onChange={(e) => onRepsChange(e.target.value ? Number(e.target.value) : null)}
          disabled={disabled || isCompleted}
          className="h-7 w-12 text-center text-xs px-1"
          placeholder="reps"
        />
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => handleRepsIncrement(1)}
          disabled={disabled || isCompleted}
          aria-label="Increase reps"
        >
          <Plus className="size-3" />
        </Button>
      </div>

      {/* Complete checkbox and actions */}
      <div className="flex items-center gap-1">
        {showRpe && (
          <Select
            value={rpe?.toString() ?? ""}
            onValueChange={(value) => onRpeChange(value ? Number(value) : null)}
            disabled={disabled || isCompleted}
          >
            <SelectTrigger className="h-7 w-12 text-xs px-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Checkbox
          checked={isCompleted}
          onCheckedChange={onComplete}
          disabled={disabled || (!weight && !reps)}
          className={cn(
            "size-6 data-checked:bg-green-500 data-checked:border-green-500",
            isCompleted && "data-checked:bg-green-600",
          )}
        />

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDelete}
          disabled={disabled}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Delete set"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}

// Compact version for mobile
function SetRowCompact({
  setNumber,
  weight,
  reps,
  setType,
  isCompleted,
  previousWeight,
  previousReps,
  weightUnit = "kg",
  onWeightChange,
  onRepsChange,
  onComplete,
  onDelete,
  disabled = false,
  className,
}: Omit<SetRowProps, "rpe" | "onRpeChange" | "onSetTypeChange">) {
  return (
    <div className={cn("flex items-center gap-2 py-2", isCompleted && "opacity-60", className)}>
      <span
        className={cn(
          "w-6 text-center text-xs font-medium",
          setType === "warmup" && "text-yellow-500",
          setType === "failure" && "text-red-500",
          setType === "drop" && "text-blue-500",
        )}
      >
        {setNumber}
      </span>

      <div className="text-muted-foreground text-xs min-w-[50px]">
        {previousWeight && previousReps ? `${previousWeight}x${previousReps}` : "-"}
      </div>

      <Input
        type="number"
        value={weight ?? ""}
        onChange={(e) => onWeightChange(e.target.value ? Number(e.target.value) : null)}
        disabled={disabled || isCompleted}
        className="h-8 w-16 text-center text-xs"
        placeholder={weightUnit}
      />

      <Input
        type="number"
        value={reps ?? ""}
        onChange={(e) => onRepsChange(e.target.value ? Number(e.target.value) : null)}
        disabled={disabled || isCompleted}
        className="h-8 w-12 text-center text-xs"
        placeholder="reps"
      />

      <Button
        variant={isCompleted ? "default" : "outline"}
        size="icon-sm"
        onClick={onComplete}
        disabled={disabled || (!weight && !reps)}
        className={cn(isCompleted && "bg-green-500 hover:bg-green-600")}
      >
        <Check className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        disabled={disabled}
        className="text-muted-foreground"
      >
        <Trash2 className="size-3" />
      </Button>
    </div>
  );
}

export { SetRow, SetRowCompact, SET_TYPE_LABELS };
export type { SetType };
