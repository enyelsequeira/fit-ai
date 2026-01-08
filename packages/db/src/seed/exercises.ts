import type { ExerciseCategory, ExerciseType } from "../schema/exercise";
import { enrichedExercises, type EnrichedExercise } from "./free-exercise-db-data";

/**
 * Default exercises to seed the database
 * These are common exercises across different categories
 * Now enriched with images and instructions from Free Exercise DB
 */
export type SeedExercise = {
  name: string;
  description: string;
  category: ExerciseCategory;
  muscleGroups: string[];
  equipment: string;
  exerciseType: ExerciseType;
  // New fields from Free Exercise DB
  externalId: string | null;
  externalSource: "free-exercise-db" | null;
  primaryImage: string | null;
  images: string[];
  instructions: string[];
  level: "beginner" | "intermediate" | "expert" | null;
  force: "push" | "pull" | "static" | null;
  mechanic: "compound" | "isolation" | null;
};

/**
 * Export enriched exercises as the default exercises
 */
export const defaultExercises: SeedExercise[] = enrichedExercises;

/**
 * Legacy type for backward compatibility
 */
export type LegacySeedExercise = {
  name: string;
  description: string;
  category: ExerciseCategory;
  muscleGroups: string[];
  equipment: string;
  exerciseType: ExerciseType;
};

/**
 * Convert enriched exercise to legacy format (for backward compatibility)
 */
export function toLegacyFormat(exercise: EnrichedExercise): LegacySeedExercise {
  return {
    name: exercise.name,
    description: exercise.description,
    category: exercise.category,
    muscleGroups: exercise.muscleGroups,
    equipment: exercise.equipment,
    exerciseType: exercise.exerciseType,
  };
}

/**
 * SQL to generate INSERT statements for seeding (legacy format without new fields)
 * Use this with wrangler d1 execute for basic seeding
 */
export function generateLegacySeedSQL(): string {
  const values = defaultExercises
    .map((ex) => {
      const muscleGroupsJSON = JSON.stringify(ex.muscleGroups);
      return `('${ex.name.replace(/'/g, "''")}', '${ex.description.replace(/'/g, "''")}', '${ex.category}', '${muscleGroupsJSON}', '${ex.equipment}', '${ex.exerciseType}', 1, NULL)`;
    })
    .join(",\n  ");

  return `INSERT INTO exercise (name, description, category, muscle_groups, equipment, exercise_type, is_default, created_by_user_id) VALUES
  ${values};`;
}

/**
 * SQL to generate INSERT statements for seeding (full format with new fields)
 * Use this with wrangler d1 execute for complete seeding
 */
export function generateSeedSQL(): string {
  const values = defaultExercises
    .map((ex) => {
      const muscleGroupsJSON = JSON.stringify(ex.muscleGroups);
      const imagesJSON = JSON.stringify(ex.images);
      const instructionsJSON = JSON.stringify(ex.instructions);
      const externalId = ex.externalId ? `'${ex.externalId}'` : "NULL";
      const externalSource = ex.externalSource ? `'${ex.externalSource}'` : "NULL";
      const primaryImage = ex.primaryImage ? `'${ex.primaryImage}'` : "NULL";
      const level = ex.level ? `'${ex.level}'` : "NULL";
      const force = ex.force ? `'${ex.force}'` : "NULL";
      const mechanic = ex.mechanic ? `'${ex.mechanic}'` : "NULL";

      return `('${ex.name.replace(/'/g, "''")}', '${ex.description.replace(/'/g, "''")}', '${ex.category}', '${muscleGroupsJSON}', '${ex.equipment}', '${ex.exerciseType}', 1, NULL, ${primaryImage}, '${imagesJSON}', NULL, '${instructionsJSON}', ${externalId}, ${externalSource}, ${level}, ${force}, ${mechanic})`;
    })
    .join(",\n  ");

  return `INSERT INTO exercise (name, description, category, muscle_groups, equipment, exercise_type, is_default, created_by_user_id, primary_image, images, video_url, instructions, external_id, external_source, level, force, mechanic) VALUES
  ${values};`;
}
