import type { Exercise } from "./exercise-search";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ExerciseSearch } from "./exercise-search";

interface AddExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exercise: Exercise) => void;
  selectedExerciseIds?: number[];
}

function AddExerciseModal({
  open,
  onOpenChange,
  onSelectExercise,
  selectedExerciseIds = [],
}: AddExerciseModalProps) {
  const handleSelect = (exercise: Exercise) => {
    onSelectExercise(exercise);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
          <DialogDescription>
            Search and select an exercise to add to your workout
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ExerciseSearch
            onSelect={handleSelect}
            selectedExerciseIds={selectedExerciseIds}
            className="h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { AddExerciseModal };
