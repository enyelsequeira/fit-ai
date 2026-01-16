/**
 * DetailedMeasurementsForm - Full body measurements tab panel
 * Includes weight, body fat, and all body measurements with unit selection
 */

import {
  Box,
  Divider,
  Grid,
  Group,
  NumberInput,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import { IconScale } from "@tabler/icons-react";

import { DetailedMeasurementsFields } from "./body-measurement-sections";
import type { MeasurementForm } from "./measurement-types";

interface DetailedMeasurementsFormProps {
  form: MeasurementForm;
}

export function DetailedMeasurementsForm({ form }: DetailedMeasurementsFormProps) {
  return (
    <Stack gap="md">
      <Grid>
        <Grid.Col span={6}>
          <NumberInput
            label="Weight"
            placeholder="Enter weight"
            leftSection={<IconScale size={16} />}
            min={0}
            max={500}
            decimalScale={1}
            step={0.1}
            {...form.getInputProps("weight")}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Box>
            <Text size="sm" fw={500} mb={6}>
              Weight Unit
            </Text>
            <SegmentedControl
              fullWidth
              data={[
                { label: "kg", value: "kg" },
                { label: "lb", value: "lb" },
              ]}
              {...form.getInputProps("weightUnit")}
            />
          </Box>
        </Grid.Col>
      </Grid>

      <NumberInput
        label="Body Fat Percentage"
        placeholder="Enter body fat %"
        min={0}
        max={100}
        decimalScale={1}
        step={0.1}
        suffix="%"
        {...form.getInputProps("bodyFatPercentage")}
      />

      <Divider label="Body Measurements" labelPosition="center" />

      <Box>
        <Group justify="space-between" mb="sm">
          <Text size="sm" fw={500}>
            Length Unit
          </Text>
          <SegmentedControl
            size="xs"
            data={[
              { label: "cm", value: "cm" },
              { label: "in", value: "in" },
            ]}
            {...form.getInputProps("lengthUnit")}
          />
        </Group>
      </Box>

      <DetailedMeasurementsFields form={form} />
    </Stack>
  );
}
