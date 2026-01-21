/**
 * useWorkoutSession - Hook for managing workout session state
 * Tracks active exercise/set, computes next actions, and integrates with rest timer
 */

import { useMemo, useCallback, useState, useEffect } from "react";

import type { UseRestTimerReturn } from "../components/workout-timer";

/**
 * Represents an exercise set from the workout data
 */
interface WorkoutSet {
  id: number;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  completedAt: string | null;
}

/**
 * Represents an exercise in the workout
 */
interface WorkoutExercise {
  id: number;
  exerciseId: number;
  orderIndex: number;
  notes: string | null;
  exercise: {
    id: number;
    name: string;
    primaryMuscles: string[] | null;
  };
  sets: WorkoutSet[];
}

/**
 * Full workout data structure
 */
interface WorkoutData {
  id: number;
  name: string | null;
  startedAt: string;
  completedAt: string | null;
  workoutExercises: WorkoutExercise[] | null;
}

/**
 * Next set info for display
 */
export interface NextSetInfo {
  exerciseIndex: number;
  exerciseName: string;
  setIndex: number;
  setNumber: number;
  totalSets: number;
  setId: number;
  targetWeight: number | null;
  targetReps: number | null;
  previousSet: { weight: number; reps: number } | null;
}

/**
 * Workout session statistics
 */
export interface WorkoutSessionStats {
  totalVolume: number;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  estimatedTimeRemaining: number | null;
  elapsedTime: number;
}

export interface UseWorkoutSessionOptions {
  workout: WorkoutData | null | undefined;
  restTimer?: UseRestTimerReturn;
  onSetComplete?: (setId: number) => void;
}

export interface UseWorkoutSessionReturn {
  /** Index of the current/active exercise */
  currentExerciseIndex: number;
  /** Index of the current set within the exercise */
  currentSetIndex: number;
  /** Information about the next incomplete set */
  nextSetInfo: NextSetInfo | null;
  /** Whether the workout is complete */
  isWorkoutComplete: boolean;
  /** Workout session statistics */
  stats: WorkoutSessionStats;
  /** Navigate to a specific exercise */
  goToExercise: (index: number) => void;
  /** Navigate to a specific set */
  goToSet: (exerciseIndex: number, setIndex: number) => void;
  /** Handle set completion (triggers rest timer if provided) */
  handleSetComplete: (setId: number) => void;
  /** Exercises formatted for navigation component */
  exercisesForNav: Array<{
    id: number;
    name: string;
    completedSets: number;
    totalSets: number;
  }>;
}

/**
 * Hook for managing workout session state
 */
export function useWorkoutSession(options: UseWorkoutSessionOptions): UseWorkoutSessionReturn {
  const { workout, restTimer, onSetComplete } = options;

  // Track current position manually (for navigation)
  const [manualExerciseIndex, setManualExerciseIndex] = useState<number | null>(null);
  const [manualSetIndex, setManualSetIndex] = useState<number | null>(null);

  // Calculate elapsed time
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every second for in-progress workouts
  useEffect(() => {
    if (!workout?.startedAt || workout?.completedAt) {
      return;
    }

    const updateElapsed = () => {
      const started = new Date(workout.startedAt).getTime();
      const now = Date.now();
      setElapsedTime(Math.floor((now - started) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [workout?.startedAt, workout?.completedAt]);

  // Find next incomplete set
  const nextSetInfo = useMemo((): NextSetInfo | null => {
    if (!workout?.workoutExercises) return null;

    for (let exIdx = 0; exIdx < workout.workoutExercises.length; exIdx++) {
      const exercise = workout.workoutExercises[exIdx];
      if (!exercise) continue;

      for (let setIdx = 0; setIdx < exercise.sets.length; setIdx++) {
        const set = exercise.sets[setIdx];
        if (!set) continue;

        if (!set.completedAt) {
          // Find previous completed set for target values
          let previousSet: { weight: number; reps: number } | null = null;
          if (setIdx > 0) {
            const prevSet = exercise.sets[setIdx - 1];
            if (prevSet?.weight !== null && prevSet?.reps !== null) {
              previousSet = { weight: prevSet.weight, reps: prevSet.reps };
            }
          }

          return {
            exerciseIndex: exIdx,
            exerciseName: exercise.exercise.name,
            setIndex: setIdx,
            setNumber: set.setNumber,
            totalSets: exercise.sets.length,
            setId: set.id,
            targetWeight: previousSet?.weight ?? set.weight,
            targetReps: previousSet?.reps ?? set.reps,
            previousSet,
          };
        }
      }
    }

    return null;
  }, [workout?.workoutExercises]);

  // Current position (use manual if set, otherwise use next incomplete)
  const currentExerciseIndex = manualExerciseIndex ?? nextSetInfo?.exerciseIndex ?? 0;
  const currentSetIndex = manualSetIndex ?? nextSetInfo?.setIndex ?? 0;

  // Calculate statistics
  const stats = useMemo((): WorkoutSessionStats => {
    if (!workout?.workoutExercises) {
      return {
        totalVolume: 0,
        exerciseCount: 0,
        completedSets: 0,
        totalSets: 0,
        estimatedTimeRemaining: null,
        elapsedTime,
      };
    }

    let totalVolume = 0;
    let completedSets = 0;
    let totalSets = 0;

    for (const exercise of workout.workoutExercises) {
      for (const set of exercise.sets) {
        totalSets++;
        if (set.completedAt) {
          completedSets++;
          if (set.weight !== null && set.reps !== null) {
            totalVolume += set.weight * set.reps;
          }
        }
      }
    }

    // Estimate remaining time based on average set time
    let estimatedTimeRemaining: number | null = null;
    if (completedSets > 0 && elapsedTime > 0) {
      const avgSetTime = elapsedTime / completedSets;
      const remainingSets = totalSets - completedSets;
      estimatedTimeRemaining = Math.round((avgSetTime * remainingSets) / 60); // in minutes
    }

    return {
      totalVolume,
      exerciseCount: workout.workoutExercises.length,
      completedSets,
      totalSets,
      estimatedTimeRemaining,
      elapsedTime,
    };
  }, [workout?.workoutExercises, elapsedTime]);

  // Check if workout is complete
  const isWorkoutComplete = useMemo(() => {
    if (workout?.completedAt) return true;
    if (!workout?.workoutExercises || workout.workoutExercises.length === 0) return false;
    return nextSetInfo === null && stats.completedSets > 0;
  }, [workout?.completedAt, workout?.workoutExercises, nextSetInfo, stats]);

  // Navigation functions
  const goToExercise = useCallback((index: number) => {
    setManualExerciseIndex(index);
    setManualSetIndex(0);
  }, []);

  const goToSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setManualExerciseIndex(exerciseIndex);
    setManualSetIndex(setIndex);
  }, []);

  // Handle set completion with rest timer integration
  const handleSetComplete = useCallback(
    (setId: number) => {
      // Call the completion callback
      onSetComplete?.(setId);

      // Start rest timer if available and auto-start is enabled
      if (restTimer && restTimer.settings.autoStartOnSetComplete) {
        restTimer.startTimer(restTimer.settings.defaultRestTime, setId);
      }

      // Clear manual position to auto-advance to next set
      setManualExerciseIndex(null);
      setManualSetIndex(null);
    },
    [onSetComplete, restTimer],
  );

  // Format exercises for navigation component
  const exercisesForNav = useMemo(() => {
    if (!workout?.workoutExercises) return [];

    return workout.workoutExercises.map((ex) => ({
      id: ex.id,
      name: ex.exercise.name,
      completedSets: ex.sets.filter((s) => s.completedAt !== null).length,
      totalSets: ex.sets.length,
    }));
  }, [workout?.workoutExercises]);

  return {
    currentExerciseIndex,
    currentSetIndex,
    nextSetInfo,
    isWorkoutComplete,
    stats,
    goToExercise,
    goToSet,
    handleSetComplete,
    exercisesForNav,
  };
}
