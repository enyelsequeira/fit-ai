import { IconLoader2, IconStar } from "@tabler/icons-react";
import { useState } from "react";

import { Box, Button, Group, Stack, Text, Textarea, UnstyledButton } from "@mantine/core";

type WorkoutMood = "great" | "good" | "okay" | "tired" | "bad";

const MOOD_OPTIONS: { value: WorkoutMood; label: string; emoji: string }[] = [
  { value: "great", label: "Great", emoji: "great" },
  { value: "good", label: "Good", emoji: "good" },
  { value: "okay", label: "Okay", emoji: "okay" },
  { value: "tired", label: "Tired", emoji: "tired" },
  { value: "bad", label: "Bad", emoji: "bad" },
];

interface CompleteWorkoutFormProps {
  onSubmit: (data: { rating: number; mood: WorkoutMood; notes: string }) => void;
  isSubmitting?: boolean;
  className?: string;
}

function CompleteWorkoutForm({ onSubmit, isSubmitting = false }: CompleteWorkoutFormProps) {
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
    <form onSubmit={handleSubmit}>
      <Stack gap="lg">
        {/* Rating */}
        <Stack gap="xs">
          <Text fz="sm" fw={500}>
            How was your workout?
          </Text>
          <Group gap={4}>
            {[1, 2, 3, 4, 5].map((value) => (
              <UnstyledButton
                key={value}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                p={4}
                style={{
                  transition: "transform 150ms",
                  transform: hoveredRating >= value ? "scale(1.1)" : undefined,
                }}
              >
                <IconStar
                  style={{
                    width: 32,
                    height: 32,
                    transition: "color 150ms, fill 150ms",
                    fill:
                      (hoveredRating || rating) >= value
                        ? "var(--mantine-color-yellow-4)"
                        : "transparent",
                    color:
                      (hoveredRating || rating) >= value
                        ? "var(--mantine-color-yellow-4)"
                        : "var(--mantine-color-dimmed)",
                  }}
                />
              </UnstyledButton>
            ))}
          </Group>
          {rating > 0 && (
            <Text fz="xs" c="dimmed">
              {rating === 1 && "Could be better"}
              {rating === 2 && "It was okay"}
              {rating === 3 && "Pretty good"}
              {rating === 4 && "Great workout!"}
              {rating === 5 && "Best workout ever!"}
            </Text>
          )}
        </Stack>

        {/* Mood */}
        <Stack gap="xs">
          <Text fz="sm" fw={500}>
            How are you feeling?
          </Text>
          <Group gap="xs">
            {MOOD_OPTIONS.map((option) => (
              <UnstyledButton
                key={option.value}
                onClick={() => setMood(option.value)}
                px="sm"
                py="xs"
                style={{
                  border:
                    mood === option.value
                      ? "1px solid var(--mantine-color-blue-5)"
                      : "1px solid var(--mantine-color-default-border)",
                  backgroundColor:
                    mood === option.value
                      ? "var(--mantine-color-blue-filled)"
                      : "var(--mantine-color-body)",
                  color: mood === option.value ? "white" : undefined,
                  transition: "all 150ms",
                }}
              >
                <Group gap="xs">
                  <Text fz="lg">{getMoodEmoji(option.value)}</Text>
                  <Text fz="xs">{option.label}</Text>
                </Group>
              </UnstyledButton>
            ))}
          </Group>
        </Stack>

        {/* Notes */}
        <Stack gap="xs">
          <Text fz="sm" fw={500}>
            Notes (optional)
          </Text>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did the workout go? Any notes for next time?"
            rows={3}
          />
        </Stack>

        {/* Submit */}
        <Button type="submit" fullWidth disabled={rating === 0 || !mood || isSubmitting}>
          {isSubmitting ? (
            <>
              <IconLoader2
                style={{
                  width: 16,
                  height: 16,
                  marginRight: 8,
                  animation: "spin 1s linear infinite",
                }}
              />
              Saving...
            </>
          ) : (
            "Complete Workout"
          )}
        </Button>
      </Stack>
    </form>
  );
}

function getMoodEmoji(mood: WorkoutMood): string {
  switch (mood) {
    case "great":
      return String.fromCodePoint(0x1f604);
    case "good":
      return String.fromCodePoint(0x1f642);
    case "okay":
      return String.fromCodePoint(0x1f610);
    case "tired":
      return String.fromCodePoint(0x1f613);
    case "bad":
      return String.fromCodePoint(0x1f61e);
  }
}

export { CompleteWorkoutForm, MOOD_OPTIONS };
export type { WorkoutMood };
