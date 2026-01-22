/**
 * SetEntryCard - Gym Mode style set entry with large touch inputs
 * Features: Large weight/reps inputs, previous hint, green complete button
 * Bug fix: Pre-filled values now enable the Complete button immediately
 */

import { IconCheck } from "@tabler/icons-react";

import type { SetEntryCardProps } from "./set-entry-card.types";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import styles from "./set-entry-card.module.css";

export function SetEntryCard({
  data,
  actions,
  isLoading = false,
  disabled = false,
}: SetEntryCardProps) {
  const { setNumber, weight, reps, previousWeight, previousReps } = data;

  const { onWeightChange, onRepsChange, onComplete } = actions;

  const hasPreviousData = previousWeight != null && previousReps != null;

  // FIX: Button is enabled when weight and reps have actual values (not null)
  // This includes pre-filled values from previous sets
  const canComplete =
    weight != null && weight > 0 && reps != null && reps > 0 && !isLoading && !disabled;

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      onWeightChange(null);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        onWeightChange(numValue);
      }
    }
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      onRepsChange(null);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        onRepsChange(numValue);
      }
    }
  };

  return (
    <div className={styles.card}>
      {/* Header with set number and previous hint */}
      <div className={styles.header}>
        <FitAiText.Label className={styles.setNumber}>SET {setNumber}</FitAiText.Label>
        {hasPreviousData && (
          <FitAiText.Caption>
            Last: {previousWeight}kg x {previousReps}
          </FitAiText.Caption>
        )}
      </div>

      {/* Weight and Reps inputs */}
      <div className={styles.inputsRow}>
        <div className={styles.inputGroup}>
          <input
            type="number"
            className={styles.inputField}
            value={weight ?? ""}
            onChange={handleWeightChange}
            placeholder={previousWeight?.toString() ?? "0"}
            min={0}
            max={500}
            step={0.5}
            disabled={disabled || isLoading}
            aria-label="Weight in kg"
          />
          <div className={styles.inputLabel}>kg</div>
        </div>

        <div className={styles.inputGroup}>
          <input
            type="number"
            className={styles.inputField}
            value={reps ?? ""}
            onChange={handleRepsChange}
            placeholder={previousReps?.toString() ?? "0"}
            min={0}
            max={100}
            step={1}
            disabled={disabled || isLoading}
            aria-label="Reps"
          />
          <div className={styles.inputLabel}>reps</div>
        </div>
      </div>

      {/* Complete Set button */}
      <FitAiButton
        variant="success"
        fullWidth
        size="lg"
        disabled={!canComplete}
        loading={isLoading}
        onClick={onComplete}
        aria-label={isLoading ? "Completing set..." : "Complete set"}
        className={styles.completeButton}
        leftSection={!isLoading && <IconCheck size={20} />}
      >
        {isLoading ? "COMPLETING..." : "COMPLETE SET"}
      </FitAiButton>
    </div>
  );
}
