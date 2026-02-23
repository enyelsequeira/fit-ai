/**
 * Body measurement section components
 * Each section groups related body measurements together
 */

import type { MeasurementForm } from "./measurement-types";

import { Divider, Grid, Group, Stack, Text } from "@mantine/core";
import { IconBone, IconStretching, IconUserScan, IconWalk } from "@tabler/icons-react";

import { MeasurementField } from "./measurement-field";

interface SectionProps {
  form: MeasurementForm;
}

function SectionHeader({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Group gap="xs" align="center">
      {icon}
      <Text size="sm" fw={500} c="dimmed">
        {children}
      </Text>
    </Group>
  );
}

export function TorsoMeasurements({ form }: SectionProps) {
  const unit = form.values.lengthUnit;

  return (
    <Stack gap="sm">
      <SectionHeader icon={<IconUserScan size={14} color="var(--mantine-color-dimmed)" />}>
        Torso
      </SectionHeader>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <MeasurementField
            form={form}
            name="chest"
            label="Chest"
            placeholder={`Chest (${unit})`}
            max={300}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <MeasurementField
            form={form}
            name="waist"
            label="Waist"
            placeholder={`Waist (${unit})`}
            max={300}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <MeasurementField
            form={form}
            name="hips"
            label="Hips"
            placeholder={`Hips (${unit})`}
            max={300}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

export function UpperBodyMeasurements({ form }: SectionProps) {
  const unit = form.values.lengthUnit;

  return (
    <Stack gap="sm">
      <Divider />
      <SectionHeader icon={<IconBone size={14} color="var(--mantine-color-dimmed)" />}>
        Upper Body
      </SectionHeader>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <MeasurementField
            form={form}
            name="neck"
            label="Neck"
            placeholder={`Neck (${unit})`}
            max={100}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <MeasurementField
            form={form}
            name="shoulders"
            label="Shoulders"
            placeholder={`Shoulders (${unit})`}
            max={200}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

export function ArmsMeasurements({ form }: SectionProps) {
  const unit = form.values.lengthUnit;

  return (
    <Stack gap="sm">
      <Divider />
      <SectionHeader icon={<IconStretching size={14} color="var(--mantine-color-dimmed)" />}>
        Arms
      </SectionHeader>
      <Grid>
        <Grid.Col span={6}>
          <MeasurementField
            form={form}
            name="leftArm"
            label="Left Arm"
            placeholder={`Left (${unit})`}
            max={100}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <MeasurementField
            form={form}
            name="rightArm"
            label="Right Arm"
            placeholder={`Right (${unit})`}
            max={100}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

export function LegsMeasurements({ form }: SectionProps) {
  const unit = form.values.lengthUnit;

  return (
    <Stack gap="sm">
      <Divider />
      <SectionHeader icon={<IconWalk size={14} color="var(--mantine-color-dimmed)" />}>
        Legs
      </SectionHeader>
      <Grid>
        <Grid.Col span={{ base: 6, sm: 3 }}>
          <MeasurementField
            form={form}
            name="leftThigh"
            label="Left Thigh"
            placeholder={`Left (${unit})`}
            max={150}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 6, sm: 3 }}>
          <MeasurementField
            form={form}
            name="rightThigh"
            label="Right Thigh"
            placeholder={`Right (${unit})`}
            max={150}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 6, sm: 3 }}>
          <MeasurementField
            form={form}
            name="leftCalf"
            label="Left Calf"
            placeholder={`Left (${unit})`}
            max={100}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 6, sm: 3 }}>
          <MeasurementField
            form={form}
            name="rightCalf"
            label="Right Calf"
            placeholder={`Right (${unit})`}
            max={100}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

export function DetailedMeasurementsFields({ form }: SectionProps) {
  return (
    <Stack gap="md">
      <TorsoMeasurements form={form} />
      <UpperBodyMeasurements form={form} />
      <ArmsMeasurements form={form} />
      <LegsMeasurements form={form} />
    </Stack>
  );
}
