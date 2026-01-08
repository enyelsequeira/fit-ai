import { Loader2, Star } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type WorkoutMood = "great" | "good" | "okay" | "tired" | "bad";

const MOOD_OPTIONS: { value: WorkoutMood; label: string; emoji: string }[] = [
  { value: "great", label: "Great", emoji: "😄" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "tired", label: "Tired", emoji: "😓" },
  { value: "bad", label: "Bad", emoji: "😞" },
];

interface CompleteWorkoutFormProps {
  onSubmit: (data: { rating: number; mood: WorkoutMood; notes: string }) => void;
  isSubmitting?: boolean;
  className?: string;
}

function CompleteWorkoutForm({
  onSubmit,
  isSubmitting = false,
  className,
}: CompleteWorkoutFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [mood, setMood] = useState<WorkoutMood | null>(null);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !mood) return;
    onSubmit({ rating, mood, notes });
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Rating */}
      <div className="space-y-2">
        <label className="text-sm font-medium">How was your workout?</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "size-8 transition-colors",
                  (hoveredRating || rating) >= value
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-xs text-muted-foreground">
            {rating === 1 && "Could be better"}
            {rating === 2 && "It was okay"}
            {rating === 3 && "Pretty good"}
            {rating === 4 && "Great workout!"}
            {rating === 5 && "Best workout ever!"}
          </p>
        )}
      </div>

      {/* Mood */}
      <div className="space-y-2">
        <label className="text-sm font-medium">How are you feeling?</label>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMood(option.value)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 border rounded-none transition-colors",
                mood === option.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:bg-muted",
              )}
            >
              <span className="text-lg">{option.emoji}</span>
              <span className="text-xs">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Notes (optional)</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did the workout go? Any notes for next time?"
          rows={3}
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={rating === 0 || !mood || isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Complete Workout"
        )}
      </Button>
    </form>
  );
}

export { CompleteWorkoutForm, MOOD_OPTIONS };
export type { WorkoutMood };
