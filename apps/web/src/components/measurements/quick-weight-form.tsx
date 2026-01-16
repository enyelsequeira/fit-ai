/**
 * QuickWeightForm - Simplified weight entry tab panel
 * Provides fast weight logging with optional body measurements expansion
 */

import {
  Box,
  Button,
  Collapse,
  Grid,
  NumberInput,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconChevronUp, IconScale } from "@tabler/icons-react";

import { DetailedMeasurementsFields } from "./body-measurement-sections";
import type { MeasurementForm } from "./measurement-types";
import styles from "./log-measurement-modal.module.css";

interface QuickWeightFormProps {
  form: MeasurementForm;
}

export function QuickWeightForm({ form }: QuickWeightFormProps) {
  const [detailsExpanded, { toggle: toggleDetails }] = useDisclosure(false);

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
              Unit
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

      <Button
        variant="subtle"
        size="sm"
        onClick={toggleDetails}
        rightSection={detailsExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        className={styles.expandButton}
        data-expanded={detailsExpanded ? "true" : undefined}
      >
        {detailsExpanded ? "Hide" : "Add"} body measurements
      </Button>

      <Collapse in={detailsExpanded}>
        <DetailedMeasurementsFields form={form} />
      </Collapse>
    </Stack>
  );
}
