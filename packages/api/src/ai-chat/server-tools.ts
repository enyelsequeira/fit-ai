import { createQueryTools } from "./tools/query-tools";
import { createTemplateTools } from "./tools/template-tools";
import { createWorkoutTools } from "./tools/workout-tools";
import { createProgressTools } from "./tools/progress-tools";
import { createExerciseTools } from "./tools/exercise-tools";

export function createServerTools(userId: string) {
  return [
    ...createQueryTools(userId),
    ...createTemplateTools(userId),
    ...createWorkoutTools(userId),
    ...createProgressTools(userId),
    ...createExerciseTools(userId),
  ];
}
