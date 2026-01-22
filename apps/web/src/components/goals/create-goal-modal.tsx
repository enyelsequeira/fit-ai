/**
 * CreateGoalModal - Multi-step wizard for creating goals
 * Step 1: Select goal type
 * Step 2: Enter goal details based on type
 */

import { Group, Modal, Stepper } from "@mantine/core";
import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import type { CreateGoalModalProps } from "./create-goal-modal-types";
import { GoalTypeSelector } from "./goal-type-selector";
import { WeightGoalForm } from "./weight-goal-form";
import { StrengthGoalForm } from "./strength-goal-form";
import { BodyMeasurementGoalForm } from "./body-measurement-goal-form";
import { WorkoutFrequencyGoalForm } from "./workout-frequency-goal-form";
import { CustomGoalForm } from "./custom-goal-form";
import { useCreateGoalForm } from "./use-create-goal-form";

export function CreateGoalModal({
  opened,
  onClose,
  onCreateWeightGoal,
  onCreateStrengthGoal,
  onCreateBodyMeasurementGoal,
  onCreateWorkoutFrequencyGoal,
  onCreateCustomGoal,
  isLoading,
}: CreateGoalModalProps) {
  const {
    activeStep,
    selectedType,
    weightForm,
    strengthForm,
    bodyMeasurementForm,
    workoutFrequencyForm,
    customForm,
    setWeightForm,
    setStrengthForm,
    setBodyMeasurementForm,
    setWorkoutFrequencyForm,
    setCustomForm,
    handleClose,
    handleTypeSelect,
    handleNext,
    handleBack,
    handleSubmit,
    isStep1Valid,
    isStep2Valid,
  } = useCreateGoalForm(
    {
      onCreateWeightGoal,
      onCreateStrengthGoal,
      onCreateBodyMeasurementGoal,
      onCreateWorkoutFrequencyGoal,
      onCreateCustomGoal,
    },
    onClose,
  );

  const renderFormByType = () => {
    switch (selectedType) {
      case "weight":
        return (
          <WeightGoalForm
            values={weightForm}
            onChange={(field, value) => setWeightForm((prev) => ({ ...prev, [field]: value }))}
          />
        );
      case "strength":
        return (
          <StrengthGoalForm
            values={strengthForm}
            onChange={(field, value) => setStrengthForm((prev) => ({ ...prev, [field]: value }))}
          />
        );
      case "body_measurement":
        return (
          <BodyMeasurementGoalForm
            values={bodyMeasurementForm}
            onChange={(field, value) =>
              setBodyMeasurementForm((prev) => ({ ...prev, [field]: value }))
            }
          />
        );
      case "workout_frequency":
        return (
          <WorkoutFrequencyGoalForm
            values={workoutFrequencyForm}
            onChange={(field, value) =>
              setWorkoutFrequencyForm((prev) => ({ ...prev, [field]: value }))
            }
          />
        );
      case "custom":
        return (
          <CustomGoalForm
            values={customForm}
            onChange={(field, value) => setCustomForm((prev) => ({ ...prev, [field]: value }))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Create New Goal" size="lg">
      <Stepper active={activeStep} size="sm" mb="xl">
        <Stepper.Step label="Goal Type" description="Choose type">
          <GoalTypeSelector selectedType={selectedType} onSelect={handleTypeSelect} />
        </Stepper.Step>
        <Stepper.Step label="Details" description="Set targets">
          {renderFormByType()}
        </Stepper.Step>
      </Stepper>

      <Group justify="space-between" mt="xl">
        {activeStep === 0 ? (
          <>
            <FitAiButton variant="ghost" onClick={handleClose}>
              Cancel
            </FitAiButton>
            <FitAiButton onClick={handleNext} disabled={!isStep1Valid}>
              Next
            </FitAiButton>
          </>
        ) : (
          <>
            <FitAiButton variant="ghost" onClick={handleBack}>
              Back
            </FitAiButton>
            <FitAiButton onClick={handleSubmit} loading={isLoading} disabled={!isStep2Valid()}>
              Create Goal
            </FitAiButton>
          </>
        )}
      </Group>
    </Modal>
  );
}
