import { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { FocusedExerciseCard } from "./focused-exercise-card";
import type { ExerciseCardData } from "./focused-exercise-card.types";
import type { WorkoutExercise } from "../../types";
import styles from "./exercise-pager.module.css";

interface ExercisePagerProps {
  exercises: WorkoutExercise[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onSetComplete: (
    exerciseId: number,
    setId: number,
    weight: number,
    reps: number,
    rpe?: number,
  ) => void;
  onAddSet: (workoutExerciseId: number, setsCount: number) => void;
  isLoading?: boolean;
}

function transformExerciseToCardData(exercise: WorkoutExercise): ExerciseCardData {
  const sets = exercise.sets ?? [];
  const completedSets = sets.filter((set) => set.completedAt !== null);
  const incompleteSets = sets.filter((set) => set.completedAt === null);
  const currentSet = incompleteSets[0] ?? null;
  const previousCompleted = completedSets[completedSets.length - 1];

  return {
    exerciseName: exercise.exercise?.name ?? "Unknown",
    exerciseCategory: exercise.exercise?.category ?? undefined,
    exerciseEquipment: exercise.exercise?.equipment ?? undefined,
    currentSetIndex: completedSets.length,
    totalSets: sets.length,
    completedSets,
    currentSet,
    previousSet: previousCompleted
      ? { weight: previousCompleted.weight, reps: previousCompleted.reps }
      : undefined,
  };
}

export function ExercisePager({
  exercises,
  currentIndex,
  onIndexChange,
  onSetComplete,
  onAddSet,
  isLoading,
}: ExercisePagerProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    startIndex: currentIndex,
  });

  // Sync carousel with external currentIndex
  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== currentIndex) {
      emblaApi.scrollTo(currentIndex);
    }
  }, [emblaApi, currentIndex]);

  // Notify parent when user swipes
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const selectedIndex = emblaApi.selectedScrollSnap();
      if (selectedIndex !== currentIndex) onIndexChange(selectedIndex);
    };
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, currentIndex, onIndexChange]);

  const handleSetComplete = useCallback(
    (exerciseId: number, setId: number) => (weight: number, reps: number, rpe?: number) => {
      onSetComplete(exerciseId, setId, weight, reps, rpe);
    },
    [onSetComplete],
  );

  const handleAddSet = useCallback(
    (workoutExerciseId: number, setsCount: number) => () => onAddSet(workoutExerciseId, setsCount),
    [onAddSet],
  );

  return (
    <div className={styles.pager}>
      <div className={styles.viewport} ref={emblaRef}>
        <div className={styles.container}>
          {exercises.map((exercise) => {
            const cardData = transformExerciseToCardData(exercise);
            const currentSetId = cardData.currentSet?.id;
            return (
              <div key={exercise.id} className={styles.slide}>
                <FocusedExerciseCard
                  data={cardData}
                  actions={{
                    onSetComplete: handleSetComplete(exercise.id, currentSetId ?? 0),
                    onAddSet: handleAddSet(exercise.id, cardData.totalSets),
                  }}
                  isLoading={isLoading}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
