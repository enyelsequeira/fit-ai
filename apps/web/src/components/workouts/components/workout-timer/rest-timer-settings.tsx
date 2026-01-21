import type { TimerSettings } from "./timer-types";

import { Chip, Group, NumberInput, Stack, Switch, Text } from "@mantine/core";

import { DEFAULT_REST_INTERVALS, REST_INTERVAL_LABELS } from "./timer-types";

interface RestTimerSettingsProps {
  settings: TimerSettings;
  onSettingsChange: (settings: Partial<TimerSettings>) => void;
  selectedTime: number;
  onTimeSelect: (seconds: number) => void;
}

export function RestTimerSettings({
  settings,
  onSettingsChange,
  selectedTime,
  onTimeSelect,
}: RestTimerSettingsProps) {
  const handlePresetSelect = (value: string) => {
    const seconds = parseInt(value, 10);
    if (!isNaN(seconds)) {
      onTimeSelect(seconds);
    }
  };

  const handleCustomTimeChange = (value: string | number) => {
    const numValue = typeof value === "string" ? parseInt(value, 10) : value;
    if (!isNaN(numValue) && numValue >= 10 && numValue <= 600) {
      onTimeSelect(numValue);
    }
  };

  const handleSoundToggle = (checked: boolean) => {
    onSettingsChange({ soundEnabled: checked });
  };

  const handleVibrationToggle = (checked: boolean) => {
    onSettingsChange({ vibrationEnabled: checked });
  };

  const handleAutoStartToggle = (checked: boolean) => {
    onSettingsChange({ autoStartOnSetComplete: checked });
  };

  const isPresetSelected = DEFAULT_REST_INTERVALS.includes(
    selectedTime as (typeof DEFAULT_REST_INTERVALS)[number],
  );

  return (
    <Stack gap="md">
      {/* Rest Interval Presets Section */}
      <Stack gap="xs">
        <Text size="sm" fw={500} c="dimmed">
          Rest Duration
        </Text>
        <Chip.Group multiple={false} value={selectedTime.toString()} onChange={handlePresetSelect}>
          <Group gap="xs">
            {DEFAULT_REST_INTERVALS.map((interval) => (
              <Chip key={interval} value={interval.toString()} size="sm" variant="filled">
                {REST_INTERVAL_LABELS[interval] ?? `${interval}s`}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Stack>

      {/* Custom Time Input Section */}
      <Stack gap="xs">
        <Text size="sm" fw={500} c="dimmed">
          Custom Time (seconds)
        </Text>
        <NumberInput
          value={isPresetSelected ? "" : selectedTime}
          onChange={handleCustomTimeChange}
          placeholder="Enter custom time"
          min={10}
          max={600}
          step={5}
          size="sm"
          w={160}
          allowNegative={false}
          allowDecimal={false}
          suffix="s"
          description="10s - 10 min"
        />
      </Stack>

      {/* Toggle Settings Section */}
      <Stack gap="xs">
        <Text size="sm" fw={500} c="dimmed">
          Notifications
        </Text>
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm">Sound notifications</Text>
            <Switch
              checked={settings.soundEnabled}
              onChange={(event) => handleSoundToggle(event.currentTarget.checked)}
              size="sm"
              aria-label="Toggle sound notifications"
            />
          </Group>
          <Group justify="space-between">
            <Text size="sm">Vibration</Text>
            <Switch
              checked={settings.vibrationEnabled}
              onChange={(event) => handleVibrationToggle(event.currentTarget.checked)}
              size="sm"
              aria-label="Toggle vibration"
            />
          </Group>
          <Group justify="space-between">
            <Text size="sm">Auto-start on set complete</Text>
            <Switch
              checked={settings.autoStartOnSetComplete}
              onChange={(event) => handleAutoStartToggle(event.currentTarget.checked)}
              size="sm"
              aria-label="Toggle auto-start on set complete"
            />
          </Group>
        </Stack>
      </Stack>
    </Stack>
  );
}
