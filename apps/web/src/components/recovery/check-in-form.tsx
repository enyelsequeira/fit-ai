import { useState } from "react";

import {
  Box,
  Button,
  Card,
  Collapse,
  Group,
  NumberInput,
  SimpleGrid,
  Slider,
  Stack,
  Text,
  Textarea,
  UnstyledButton,
} from "@mantine/core";

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
    <form onSubmit={handleSubmit}>
      <Stack gap="lg">
        {/* Sleep Section */}
        <Card withBorder>
          <Card.Section withBorder inheritPadding py="sm">
            <Text fz="sm" fw={500}>
              Sleep
            </Text>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <Stack gap="md">
              <Box>
                <Group justify="space-between" mb="xs">
                  <Text fz="sm" fw={500}>
                    Hours of Sleep
                  </Text>
                  <Text fz="sm" fw={500} style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formData.sleepHours} hours
                  </Text>
                </Group>
                <Slider
                  value={formData.sleepHours ?? 7}
                  onChange={(value) => setFormData((prev) => ({ ...prev, sleepHours: value }))}
                  min={0}
                  max={12}
                  step={0.5}
                  marks={[
                    { value: 0, label: "0" },
                    { value: 6, label: "6" },
                    { value: 12, label: "12" },
                  ]}
                />
              </Box>

              <Box>
                <Text fz="sm" fw={500} mb="xs">
                  Sleep Quality
                </Text>
                <Group gap="xs">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <UnstyledButton
                      key={star}
                      onClick={() => setFormData((prev) => ({ ...prev, sleepQuality: star }))}
                      w={40}
                      h={40}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border:
                          (formData.sleepQuality ?? 0) >= star
                            ? "1px solid var(--mantine-color-yellow-4)"
                            : "1px solid var(--mantine-color-default-border)",
                        backgroundColor:
                          (formData.sleepQuality ?? 0) >= star
                            ? "rgba(var(--mantine-color-yellow-4-rgb), 0.2)"
                            : "transparent",
                        color:
                          (formData.sleepQuality ?? 0) >= star
                            ? "var(--mantine-color-yellow-4)"
                            : "inherit",
                        transition: "all 150ms ease",
                      }}
                    >
                      <Text fz="lg">*</Text>
                    </UnstyledButton>
                  ))}
                </Group>
              </Box>
            </Stack>
          </Card.Section>
        </Card>

        {/* Energy & Mood Section */}
        <Card withBorder>
          <Card.Section withBorder inheritPadding py="sm">
            <Text fz="sm" fw={500}>
              Energy & Mood
            </Text>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <Stack gap="md">
              <Box>
                <Group justify="space-between" mb="xs">
                  <Text fz="sm" fw={500}>
                    Energy Level
                  </Text>
                  <Text fz="sm" fw={500} style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formData.energyLevel}/10
                  </Text>
                </Group>
                <Slider
                  value={formData.energyLevel ?? 5}
                  onChange={(value) => setFormData((prev) => ({ ...prev, energyLevel: value }))}
                  min={1}
                  max={10}
                  step={1}
                />
              </Box>

              <Box>
                <Text fz="sm" fw={500} mb="xs">
                  Mood
                </Text>
                <Group gap="xs">
                  {MOODS.map((mood) => (
                    <UnstyledButton
                      key={mood.value}
                      onClick={() => setFormData((prev) => ({ ...prev, mood: mood.value }))}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        padding: "8px",
                        border:
                          formData.mood === mood.value
                            ? "1px solid var(--mantine-color-blue-filled)"
                            : "1px solid var(--mantine-color-default-border)",
                        backgroundColor:
                          formData.mood === mood.value
                            ? "rgba(var(--mantine-color-blue-filled-rgb), 0.1)"
                            : "transparent",
                        transition: "all 150ms ease",
                      }}
                    >
                      <Text fz="md">{mood.emoji}</Text>
                      <Text fz="xs">{mood.label}</Text>
                    </UnstyledButton>
                  ))}
                </Group>
              </Box>

              <Box>
                <Group justify="space-between" mb="xs">
                  <Text fz="sm" fw={500}>
                    Motivation
                  </Text>
                  <Text fz="sm" fw={500} style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formData.motivationLevel}/10
                  </Text>
                </Group>
                <Slider
                  value={formData.motivationLevel ?? 5}
                  onChange={(value) => setFormData((prev) => ({ ...prev, motivationLevel: value }))}
                  min={1}
                  max={10}
                  step={1}
                />
              </Box>
            </Stack>
          </Card.Section>
        </Card>

        {/* Physical Section */}
        <Card withBorder>
          <Card.Section withBorder inheritPadding py="sm">
            <Text fz="sm" fw={500}>
              Physical
            </Text>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <Stack gap="md">
              <Box>
                <Group justify="space-between" mb="xs">
                  <Text fz="sm" fw={500}>
                    Overall Soreness
                  </Text>
                  <Text fz="sm" fw={500} style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formData.sorenessLevel}/10
                  </Text>
                </Group>
                <Slider
                  value={formData.sorenessLevel ?? 3}
                  onChange={(value) => setFormData((prev) => ({ ...prev, sorenessLevel: value }))}
                  min={1}
                  max={10}
                  step={1}
                />
              </Box>

              <Box>
                <Text fz="sm" fw={500} mb="xs">
                  Sore Areas
                </Text>
                <SimpleGrid cols={3} spacing="xs">
                  {BODY_PARTS.map((part) => (
                    <UnstyledButton
                      key={part}
                      onClick={() => toggleSoreArea(part)}
                      p="xs"
                      style={{
                        border: formData.soreAreas?.includes(part)
                          ? "1px solid var(--mantine-color-red-5)"
                          : "1px solid var(--mantine-color-default-border)",
                        backgroundColor: formData.soreAreas?.includes(part)
                          ? "rgba(var(--mantine-color-red-5-rgb), 0.1)"
                          : "transparent",
                        color: formData.soreAreas?.includes(part)
                          ? "var(--mantine-color-red-5)"
                          : "inherit",
                        textTransform: "capitalize",
                        transition: "all 150ms ease",
                      }}
                    >
                      <Text fz="xs" ta="center">
                        {part}
                      </Text>
                    </UnstyledButton>
                  ))}
                </SimpleGrid>
              </Box>

              <Box>
                <Group justify="space-between" mb="xs">
                  <Text fz="sm" fw={500}>
                    Stress Level
                  </Text>
                  <Text fz="sm" fw={500} style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formData.stressLevel}/10
                  </Text>
                </Group>
                <Slider
                  value={formData.stressLevel ?? 5}
                  onChange={(value) => setFormData((prev) => ({ ...prev, stressLevel: value }))}
                  min={1}
                  max={10}
                  step={1}
                />
              </Box>
            </Stack>
          </Card.Section>
        </Card>

        {/* Nutrition & Hydration Section */}
        <Card withBorder>
          <Card.Section withBorder inheritPadding py="sm">
            <Text fz="sm" fw={500}>
              Nutrition & Hydration
            </Text>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <Stack gap="md">
              <Box>
                <Text fz="sm" fw={500} mb="xs">
                  Nutrition Quality
                </Text>
                <Group gap="xs">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <UnstyledButton
                      key={star}
                      onClick={() => setFormData((prev) => ({ ...prev, nutritionQuality: star }))}
                      w={40}
                      h={40}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border:
                          (formData.nutritionQuality ?? 0) >= star
                            ? "1px solid var(--mantine-color-green-4)"
                            : "1px solid var(--mantine-color-default-border)",
                        backgroundColor:
                          (formData.nutritionQuality ?? 0) >= star
                            ? "rgba(var(--mantine-color-green-4-rgb), 0.2)"
                            : "transparent",
                        color:
                          (formData.nutritionQuality ?? 0) >= star
                            ? "var(--mantine-color-green-4)"
                            : "inherit",
                        transition: "all 150ms ease",
                      }}
                    >
                      <Text fz="lg">*</Text>
                    </UnstyledButton>
                  ))}
                </Group>
              </Box>

              <Box>
                <Text fz="sm" fw={500} mb="xs">
                  Hydration Level
                </Text>
                <Group gap="xs">
                  {[1, 2, 3, 4, 5].map((drop) => (
                    <UnstyledButton
                      key={drop}
                      onClick={() => setFormData((prev) => ({ ...prev, hydrationLevel: drop }))}
                      w={40}
                      h={40}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border:
                          (formData.hydrationLevel ?? 0) >= drop
                            ? "1px solid var(--mantine-color-blue-4)"
                            : "1px solid var(--mantine-color-default-border)",
                        backgroundColor:
                          (formData.hydrationLevel ?? 0) >= drop
                            ? "rgba(var(--mantine-color-blue-4-rgb), 0.2)"
                            : "transparent",
                        color:
                          (formData.hydrationLevel ?? 0) >= drop
                            ? "var(--mantine-color-blue-4)"
                            : "inherit",
                        transition: "all 150ms ease",
                      }}
                    >
                      <Text fz="sm">~</Text>
                    </UnstyledButton>
                  ))}
                </Group>
              </Box>
            </Stack>
          </Card.Section>
        </Card>

        {/* Advanced Section */}
        <Card withBorder>
          <Card.Section inheritPadding py="sm">
            <UnstyledButton
              onClick={() => setShowAdvanced(!showAdvanced)}
              w="100%"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <Text fz="sm" fw={500}>
                Advanced (Optional)
              </Text>
              <Text fz="xs" c="dimmed">
                {showAdvanced ? "Hide" : "Show"}
              </Text>
            </UnstyledButton>
          </Card.Section>
          <Collapse in={showAdvanced}>
            <Card.Section inheritPadding py="md">
              <SimpleGrid cols={2} spacing="md">
                <NumberInput
                  label="Resting Heart Rate (BPM)"
                  placeholder="e.g., 60"
                  value={formData.restingHeartRate ?? ""}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      restingHeartRate: typeof value === "number" ? value : undefined,
                    }))
                  }
                  min={30}
                  max={200}
                />
                <NumberInput
                  label="HRV Score"
                  placeholder="e.g., 45"
                  value={formData.hrvScore ?? ""}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      hrvScore: typeof value === "number" ? value : undefined,
                    }))
                  }
                  min={0}
                />
              </SimpleGrid>
            </Card.Section>
          </Collapse>
        </Card>

        {/* Notes Section */}
        <Card withBorder>
          <Card.Section withBorder inheritPadding py="sm">
            <Text fz="sm" fw={500}>
              Notes
            </Text>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <Textarea
              placeholder="How are you feeling today? Any additional notes..."
              value={formData.notes ?? ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              minRows={3}
            />
          </Card.Section>
        </Card>

        <Button type="submit" loading={isLoading} fullWidth>
          {isLoading ? "Saving..." : "Save Check-in"}
        </Button>
      </Stack>
    </form>
  );
}

export { CheckInForm };
export type { CheckInData };
