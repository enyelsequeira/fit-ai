/**
 * Custom hook for managing create goal form state
 */

import { useCallback, useState } from "react";
import type { GoalType } from "./types";
import type { WeightGoalFormValues } from "./weight-goal-form";
import { isWeightFormValid } from "./weight-goal-form";
import type { StrengthGoalFormValues } from "./strength-goal-form";
import { isStrengthFormValid } from "./strength-goal-form";
import type { BodyMeasurementGoalFormValues } from "./body-measurement-goal-form";
import { isBodyMeasurementFormValid } from "./body-measurement-goal-form";
import type { WorkoutFrequencyGoalFormValues } from "./workout-frequency-goal-form";
import { isWorkoutFrequencyFormValid } from "./workout-frequency-goal-form";
import type { CustomGoalFormValues } from "./custom-goal-form";
import { isCustomFormValid } from "./custom-goal-form";
import type {
  BodyMeasurementGoalData,
  CreateGoalModalProps,
  CustomGoalData,
  StrengthGoalData,
  WeightGoalData,
  WorkoutFrequencyGoalData,
} from "./create-goal-modal-types";

const INITIAL_WEIGHT_FORM: WeightGoalFormValues = {
  title: "",
  description: "",
  startWeight: "",
  targetWeight: "",
  weightUnit: "kg",
  direction: "decrease",
  targetDate: null,
};

const INITIAL_STRENGTH_FORM: StrengthGoalFormValues = {
  title: "",
  description: "",
  exerciseId: "",
  startLiftWeight: "",
  targetLiftWeight: "",
  startReps: "",
  targetReps: "",
  weightUnit: "kg",
  targetDate: null,
};

const INITIAL_BODY_MEASUREMENT_FORM: BodyMeasurementGoalFormValues = {
  title: "",
  description: "",
  measurementType: null,
  startMeasurement: "",
  targetMeasurement: "",
  lengthUnit: "cm",
  direction: "decrease",
  targetDate: null,
};

const INITIAL_WORKOUT_FREQUENCY_FORM: WorkoutFrequencyGoalFormValues = {
  title: "",
  description: "",
  targetWorkoutsPerWeek: 3,
  targetDate: null,
};

const INITIAL_CUSTOM_FORM: CustomGoalFormValues = {
  title: "",
  description: "",
  customMetricName: "",
  customMetricUnit: "",
  startCustomValue: "",
  targetCustomValue: "",
  direction: "increase",
  targetDate: null,
};

type SubmitCallbacks = Pick<
  CreateGoalModalProps,
  | "onCreateWeightGoal"
  | "onCreateStrengthGoal"
  | "onCreateBodyMeasurementGoal"
  | "onCreateWorkoutFrequencyGoal"
  | "onCreateCustomGoal"
>;

export function useCreateGoalForm(callbacks: SubmitCallbacks, onClose: () => void) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedType, setSelectedType] = useState<GoalType | null>(null);
  const [weightForm, setWeightForm] = useState(INITIAL_WEIGHT_FORM);
  const [strengthForm, setStrengthForm] = useState(INITIAL_STRENGTH_FORM);
  const [bodyMeasurementForm, setBodyMeasurementForm] = useState(INITIAL_BODY_MEASUREMENT_FORM);
  const [workoutFrequencyForm, setWorkoutFrequencyForm] = useState(INITIAL_WORKOUT_FREQUENCY_FORM);
  const [customForm, setCustomForm] = useState(INITIAL_CUSTOM_FORM);

  const resetForm = useCallback(() => {
    setActiveStep(0);
    setSelectedType(null);
    setWeightForm(INITIAL_WEIGHT_FORM);
    setStrengthForm(INITIAL_STRENGTH_FORM);
    setBodyMeasurementForm(INITIAL_BODY_MEASUREMENT_FORM);
    setWorkoutFrequencyForm(INITIAL_WORKOUT_FREQUENCY_FORM);
    setCustomForm(INITIAL_CUSTOM_FORM);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleTypeSelect = useCallback((type: GoalType) => {
    setSelectedType(type);
    if (type === "weight") {
      setWeightForm((prev) => ({ ...prev, direction: "decrease" }));
    }
  }, []);

  const handleNext = useCallback(() => {
    if (activeStep === 0 && selectedType) {
      setActiveStep(1);
    }
  }, [activeStep, selectedType]);

  const handleBack = useCallback(() => {
    if (activeStep === 1) {
      setActiveStep(0);
    }
  }, [activeStep]);

  const buildWeightGoalData = (): WeightGoalData | null => {
    if (!isWeightFormValid(weightForm)) return null;
    return {
      title: weightForm.title.trim(),
      description: weightForm.description.trim() || undefined,
      startWeight: weightForm.startWeight as number,
      targetWeight: weightForm.targetWeight as number,
      weightUnit: weightForm.weightUnit,
      direction: weightForm.direction,
      targetDate: weightForm.targetDate ?? undefined,
    };
  };

  const buildStrengthGoalData = (): StrengthGoalData | null => {
    if (!isStrengthFormValid(strengthForm)) return null;
    return {
      title: strengthForm.title.trim(),
      description: strengthForm.description.trim() || undefined,
      exerciseId: strengthForm.exerciseId as number,
      startLiftWeight:
        typeof strengthForm.startLiftWeight === "number" ? strengthForm.startLiftWeight : undefined,
      targetLiftWeight:
        typeof strengthForm.targetLiftWeight === "number"
          ? strengthForm.targetLiftWeight
          : undefined,
      startReps: typeof strengthForm.startReps === "number" ? strengthForm.startReps : undefined,
      targetReps: typeof strengthForm.targetReps === "number" ? strengthForm.targetReps : undefined,
      weightUnit: strengthForm.weightUnit,
      direction: "increase",
      targetDate: strengthForm.targetDate ?? undefined,
    };
  };

  const buildBodyMeasurementGoalData = (): BodyMeasurementGoalData | null => {
    if (!isBodyMeasurementFormValid(bodyMeasurementForm)) return null;
    return {
      title: bodyMeasurementForm.title.trim(),
      description: bodyMeasurementForm.description.trim() || undefined,
      measurementType: bodyMeasurementForm.measurementType as string,
      startMeasurement: bodyMeasurementForm.startMeasurement as number,
      targetMeasurement: bodyMeasurementForm.targetMeasurement as number,
      lengthUnit: bodyMeasurementForm.lengthUnit,
      direction: bodyMeasurementForm.direction,
      targetDate: bodyMeasurementForm.targetDate ?? undefined,
    };
  };

  const buildWorkoutFrequencyGoalData = (): WorkoutFrequencyGoalData | null => {
    if (!isWorkoutFrequencyFormValid(workoutFrequencyForm)) return null;
    return {
      title: workoutFrequencyForm.title.trim(),
      description: workoutFrequencyForm.description.trim() || undefined,
      targetWorkoutsPerWeek: workoutFrequencyForm.targetWorkoutsPerWeek as number,
      targetDate: workoutFrequencyForm.targetDate ?? undefined,
    };
  };

  const buildCustomGoalData = (): CustomGoalData | null => {
    if (!isCustomFormValid(customForm)) return null;
    return {
      title: customForm.title.trim(),
      description: customForm.description.trim() || undefined,
      customMetricName: customForm.customMetricName.trim(),
      customMetricUnit: customForm.customMetricUnit.trim() || undefined,
      startCustomValue: customForm.startCustomValue as number,
      targetCustomValue: customForm.targetCustomValue as number,
      direction: customForm.direction,
      targetDate: customForm.targetDate ?? undefined,
    };
  };

  const handleSubmit = useCallback(() => {
    if (!selectedType) return;

    const submitMap = {
      weight: () => {
        const data = buildWeightGoalData();
        if (data) callbacks.onCreateWeightGoal(data);
      },
      strength: () => {
        const data = buildStrengthGoalData();
        if (data) callbacks.onCreateStrengthGoal(data);
      },
      body_measurement: () => {
        const data = buildBodyMeasurementGoalData();
        if (data) callbacks.onCreateBodyMeasurementGoal(data);
      },
      workout_frequency: () => {
        const data = buildWorkoutFrequencyGoalData();
        if (data) callbacks.onCreateWorkoutFrequencyGoal(data);
      },
      custom: () => {
        const data = buildCustomGoalData();
        if (data) callbacks.onCreateCustomGoal(data);
      },
    };

    submitMap[selectedType]();
    handleClose();
  }, [selectedType, callbacks, handleClose]);

  const isStep2Valid = (): boolean => {
    const validationMap = {
      weight: () => isWeightFormValid(weightForm),
      strength: () => isStrengthFormValid(strengthForm),
      body_measurement: () => isBodyMeasurementFormValid(bodyMeasurementForm),
      workout_frequency: () => isWorkoutFrequencyFormValid(workoutFrequencyForm),
      custom: () => isCustomFormValid(customForm),
    };
    return selectedType ? validationMap[selectedType]() : false;
  };

  return {
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
    isStep1Valid: selectedType !== null,
    isStep2Valid,
  };
}
