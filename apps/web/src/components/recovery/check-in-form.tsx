import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Mood = "great" | "good" | "neutral" | "low" | "bad";

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: "great", emoji: "great", label: "Great" },
  { value: "good", emoji: "good", label: "Good" },
  { value: "neutral", emoji: "neutral", label: "Neutral" },
  { value: "low", emoji: "low", label: "Low" },
  { value: "bad", emoji: "bad", label: "Bad" },
];

const BODY_PARTS = [
  "chest",
  "upper back",
  "lower back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "core",
  "neck",
];

interface CheckInData {
  sleepHours?: number;
  sleepQuality?: number;
  energyLevel?: number;
  stressLevel?: number;
  sorenessLevel?: number;
  soreAreas?: string[];
  restingHeartRate?: number;
  hrvScore?: number;
  motivationLevel?: number;
  mood?: Mood;
  nutritionQuality?: number;
  hydrationLevel?: number;
  notes?: string;
}

interface CheckInFormProps {
  initialData?: CheckInData | null;
  onSubmit: (data: CheckInData) => void;
  isLoading?: boolean;
}

function CheckInForm({ initialData, onSubmit, isLoading = false }: CheckInFormProps) {
  const [formData, setFormData] = useState<CheckInData>({
    sleepHours: initialData?.sleepHours ?? 7,
    sleepQuality: initialData?.sleepQuality ?? 3,
    energyLevel: initialData?.energyLevel ?? 5,
    stressLevel: initialData?.stressLevel ?? 5,
    sorenessLevel: initialData?.sorenessLevel ?? 3,
    soreAreas: initialData?.soreAreas ?? [],
    restingHeartRate: initialData?.restingHeartRate,
    hrvScore: initialData?.hrvScore,
    motivationLevel: initialData?.motivationLevel ?? 5,
    mood: initialData?.mood,
    nutritionQuality: initialData?.nutritionQuality ?? 3,
    hydrationLevel: initialData?.hydrationLevel ?? 3,
    notes: initialData?.notes ?? "",
  });

  const [showAdvanced, setShowAdvanced] = useState(
    !!(initialData?.restingHeartRate || initialData?.hrvScore),
  );

  const toggleSoreArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      soreAreas: prev.soreAreas?.includes(area)
        ? prev.soreAreas.filter((a) => a !== area)
        : [...(prev.soreAreas ?? []), area],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sleep Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sleep</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Hours of Sleep</Label>
              <span className="text-sm font-medium tabular-nums">{formData.sleepHours} hours</span>
            </div>
            <Slider
              value={[formData.sleepHours ?? 7]}
              onValueChange={(value) => {
                const newValue = Array.isArray(value) ? value[0] : value;
                setFormData((prev) => ({ ...prev, sleepHours: newValue }));
              }}
              min={0}
              max={12}
              step={0.5}
            />
          </div>

          <div className="space-y-2">
            <Label>Sleep Quality</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, sleepQuality: star }))}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-none border text-lg transition-colors",
                    (formData.sleepQuality ?? 0) >= star
                      ? "border-amber-400 bg-amber-400/20 text-amber-400"
                      : "border-input hover:bg-muted",
                  )}
                >
                  *
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Energy & Mood Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Energy & Mood</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Energy Level</Label>
              <span className="text-sm font-medium tabular-nums">{formData.energyLevel}/10</span>
            </div>
            <Slider
              value={[formData.energyLevel ?? 5]}
              onValueChange={(value) => {
                const newValue = Array.isArray(value) ? value[0] : value;
                setFormData((prev) => ({ ...prev, energyLevel: newValue }));
              }}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Mood</Label>
            <div className="flex gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, mood: mood.value }))}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-none border p-2 text-xs transition-colors",
                    formData.mood === mood.value
                      ? "border-primary bg-primary/10"
                      : "border-input hover:bg-muted",
                  )}
                >
                  <span className="text-base">{mood.emoji}</span>
                  <span>{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Motivation</Label>
              <span className="text-sm font-medium tabular-nums">
                {formData.motivationLevel}/10
              </span>
            </div>
            <Slider
              value={[formData.motivationLevel ?? 5]}
              onValueChange={(value) => {
                const newValue = Array.isArray(value) ? value[0] : value;
                setFormData((prev) => ({ ...prev, motivationLevel: newValue }));
              }}
              min={1}
              max={10}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Physical Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Physical</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Overall Soreness</Label>
              <span className="text-sm font-medium tabular-nums">{formData.sorenessLevel}/10</span>
            </div>
            <Slider
              value={[formData.sorenessLevel ?? 3]}
              onValueChange={(value) => {
                const newValue = Array.isArray(value) ? value[0] : value;
                setFormData((prev) => ({ ...prev, sorenessLevel: newValue }));
              }}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Sore Areas</Label>
            <div className="grid grid-cols-3 gap-2">
              {BODY_PARTS.map((part) => (
                <button
                  key={part}
                  type="button"
                  onClick={() => toggleSoreArea(part)}
                  className={cn(
                    "rounded-none border p-2 text-xs capitalize transition-colors",
                    formData.soreAreas?.includes(part)
                      ? "border-red-500 bg-red-500/10 text-red-500"
                      : "border-input hover:bg-muted",
                  )}
                >
                  {part}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Stress Level</Label>
              <span className="text-sm font-medium tabular-nums">{formData.stressLevel}/10</span>
            </div>
            <Slider
              value={[formData.stressLevel ?? 5]}
              onValueChange={(value) => {
                const newValue = Array.isArray(value) ? value[0] : value;
                setFormData((prev) => ({ ...prev, stressLevel: newValue }));
              }}
              min={1}
              max={10}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Nutrition & Hydration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Nutrition & Hydration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nutrition Quality</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, nutritionQuality: star }))}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-none border text-lg transition-colors",
                    (formData.nutritionQuality ?? 0) >= star
                      ? "border-green-400 bg-green-400/20 text-green-400"
                      : "border-input hover:bg-muted",
                  )}
                >
                  *
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hydration Level</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((drop) => (
                <button
                  key={drop}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, hydrationLevel: drop }))}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-none border text-sm transition-colors",
                    (formData.hydrationLevel ?? 0) >= drop
                      ? "border-blue-400 bg-blue-400/20 text-blue-400"
                      : "border-input hover:bg-muted",
                  )}
                >
                  ~
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Section */}
      <Card>
        <CardHeader>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-between text-sm font-medium"
          >
            <CardTitle className="text-sm">Advanced (Optional)</CardTitle>
            <span className="text-muted-foreground text-xs">{showAdvanced ? "Hide" : "Show"}</span>
          </button>
        </CardHeader>
        {showAdvanced && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Resting Heart Rate (BPM)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 60"
                  value={formData.restingHeartRate ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      restingHeartRate: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    }))
                  }
                  min={30}
                  max={200}
                />
              </div>
              <div className="space-y-2">
                <Label>HRV Score</Label>
                <Input
                  type="number"
                  placeholder="e.g., 45"
                  value={formData.hrvScore ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hrvScore: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))
                  }
                  min={0}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="How are you feeling today? Any additional notes..."
            value={formData.notes ?? ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : "Save Check-in"}
      </Button>
    </form>
  );
}

export { CheckInForm };
export type { CheckInData };
