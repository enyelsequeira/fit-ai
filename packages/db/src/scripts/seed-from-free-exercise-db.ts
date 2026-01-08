#!/usr/bin/env tsx
/**
 * Seed Exercises from Free Exercise DB
 *
 * Fetches exercises directly from the Free Exercise DB GitHub repository
 * and seeds them into the D1 database.
 *
 * Usage:
 *   pnpm db:seed:free-exercise-db         - Seed to local D1 database
 *   pnpm db:seed:free-exercise-db:remote  - Seed to remote D1 database
 *
 * Source: https://github.com/yuhonas/free-exercise-db
 * License: Unlicense (Public Domain)
 */

import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const isRemote = args.includes("--remote") || args.includes("-r");

const serverDir = resolve(__dirname, "../../../../apps/server");

const FREE_EXERCISE_DB_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

/**
 * Free Exercise DB exercise structure
 */
interface FreeExerciseDbExercise {
  id: string;
  name: string;
  force: "push" | "pull" | "static" | null;
  level: "beginner" | "intermediate" | "expert";
  mechanic: "compound" | "isolation" | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string; // strength, cardio, stretching, plyometrics, powerlifting, strongman, olympic weightlifting
  images: string[]; // relative paths like "3_4_Sit-Up/0.jpg"
}

/**
 * Our exercise category type
 */
type ExerciseCategory =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "cardio"
  | "flexibility"
  | "compound"
  | "other";

/**
 * Our exercise type
 */
type ExerciseType = "strength" | "cardio" | "flexibility";

/**
 * Map Free Exercise DB category to our exercise type
 */
function mapToExerciseType(freeDbCategory: string): ExerciseType {
  switch (freeDbCategory.toLowerCase()) {
    case "cardio":
      return "cardio";
    case "stretching":
      return "flexibility";
    case "strength":
    case "powerlifting":
    case "olympic weightlifting":
    case "strongman":
    case "plyometrics":
    default:
      return "strength";
  }
}

/**
 * Map primary muscle to our category
 */
function mapPrimaryMuscleToCategory(primaryMuscle: string): ExerciseCategory {
  const muscle = primaryMuscle.toLowerCase();

  // Chest
  if (muscle === "chest") return "chest";

  // Back
  if (["lats", "middle back", "lower back", "traps"].includes(muscle)) return "back";

  // Shoulders
  if (muscle === "shoulders" || muscle === "neck") return "shoulders";

  // Arms
  if (["biceps", "triceps", "forearms"].includes(muscle)) return "arms";

  // Legs
  if (["quadriceps", "hamstrings", "calves", "glutes", "adductors", "abductors"].includes(muscle))
    return "legs";

  // Core
  if (muscle === "abdominals") return "core";

  return "other";
}

/**
 * Escape string for SQL
 */
function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

/**
 * Generate full image URL from relative path
 */
function getFullImageUrl(relativePath: string): string {
  return `${IMAGE_BASE_URL}/${relativePath}`;
}

/**
 * Fetch exercises from Free Exercise DB
 */
async function fetchExercises(): Promise<FreeExerciseDbExercise[]> {
  console.log("Fetching exercises from Free Exercise DB...");

  const response = await fetch(FREE_EXERCISE_DB_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch exercises: ${response.status} ${response.statusText}`);
  }

  const exercises = (await response.json()) as FreeExerciseDbExercise[];
  console.log(`Fetched ${exercises.length} exercises`);

  return exercises;
}

/**
 * Generate SQL for all exercises
 */
function generateExercisesSQL(exercises: FreeExerciseDbExercise[]): string {
  const statements: string[] = [];

  statements.push(`-- Seeding ${exercises.length} exercises from Free Exercise DB`);

  // Step 1: Delete default exercises that aren't referenced by any workout or template
  // This keeps user-created exercises and any exercises used in workouts/templates
  statements.push(`DELETE FROM exercise
WHERE is_default = 1
  AND id NOT IN (SELECT DISTINCT exercise_id FROM workout_exercise WHERE exercise_id IS NOT NULL)
  AND id NOT IN (SELECT DISTINCT exercise_id FROM workout_template_exercise WHERE exercise_id IS NOT NULL);`);

  // Step 2: Insert all exercises from Free Exercise DB
  // Use INSERT OR IGNORE to skip any that already exist (by name match via a subquery check)
  for (const ex of exercises) {
    const primaryMuscle = ex.primaryMuscles[0] ?? "other";
    const category = mapPrimaryMuscleToCategory(primaryMuscle);
    const exerciseType = mapToExerciseType(ex.category);

    // Combine primary and secondary muscles
    const allMuscles = [...ex.primaryMuscles, ...ex.secondaryMuscles];
    const muscleGroupsJSON = JSON.stringify(allMuscles);

    // Generate full image URLs
    const fullImageUrls = ex.images.map(getFullImageUrl);
    const primaryImage = fullImageUrls[0] ?? null;
    const imagesJSON = JSON.stringify(fullImageUrls);

    const instructionsJSON = JSON.stringify(ex.instructions);

    // Build description from muscle groups and equipment
    const muscleText = ex.primaryMuscles.join(", ");
    const equipmentText = ex.equipment ?? "bodyweight";
    const description = `Targets ${muscleText}. Equipment: ${equipmentText}.`;

    const name = escapeSql(ex.name);
    const descEscaped = escapeSql(description);
    const equipment = ex.equipment ? `'${escapeSql(ex.equipment)}'` : "NULL";
    const externalId = `'${escapeSql(ex.id)}'`;
    const primaryImageSql = primaryImage ? `'${escapeSql(primaryImage)}'` : "NULL";
    const level = ex.level ? `'${ex.level}'` : "NULL";
    const force = ex.force ? `'${ex.force}'` : "NULL";
    const mechanic = ex.mechanic ? `'${ex.mechanic}'` : "NULL";

    // Insert the exercise - if name already exists, skip it
    statements.push(`INSERT INTO exercise (
  name, description, category, muscle_groups, equipment, exercise_type,
  is_default, created_by_user_id, primary_image, images, video_url,
  instructions, external_id, external_source, level, force, mechanic,
  created_at, updated_at
)
SELECT
  '${name}',
  '${descEscaped}',
  '${category}',
  '${escapeSql(muscleGroupsJSON)}',
  ${equipment},
  '${exerciseType}',
  1,
  NULL,
  ${primaryImageSql},
  '${escapeSql(imagesJSON)}',
  NULL,
  '${escapeSql(instructionsJSON)}',
  ${externalId},
  'free-exercise-db',
  ${level},
  ${force},
  ${mechanic},
  (cast(unixepoch('subsecond') * 1000 as integer)),
  (cast(unixepoch('subsecond') * 1000 as integer))
WHERE NOT EXISTS (SELECT 1 FROM exercise WHERE name = '${name}');`);

    // Update existing exercise if it exists (to add images/instructions to old data)
    statements.push(`UPDATE exercise SET
  description = '${descEscaped}',
  primary_image = ${primaryImageSql},
  images = '${escapeSql(imagesJSON)}',
  instructions = '${escapeSql(instructionsJSON)}',
  external_id = ${externalId},
  external_source = 'free-exercise-db',
  level = ${level},
  force = ${force},
  mechanic = ${mechanic},
  updated_at = (cast(unixepoch('subsecond') * 1000 as integer))
WHERE name = '${name}' AND is_default = 1;`);
  }

  return statements.join("\n\n");
}

async function main(): Promise<void> {
  console.log("\n======================================");
  console.log("  Free Exercise DB Seeder");
  console.log("======================================\n");

  const mode = isRemote ? "REMOTE" : "LOCAL";
  console.log(`Mode: ${mode}`);

  try {
    // Fetch exercises from Free Exercise DB
    const exercises = await fetchExercises();

    // Generate SQL
    const sql = generateExercisesSQL(exercises);

    // Write to temp file
    const tempFile = resolve(serverDir, "seed-free-exercise-db.sql");
    writeFileSync(tempFile, sql, "utf-8");
    console.log(`Generated SQL file with ${exercises.length} exercises`);

    // Execute via wrangler
    const remoteFlag = isRemote ? "--remote" : "--local";
    const command = `pnpm wrangler d1 execute fit-ai-database-enyelsequeira ${remoteFlag} --file=seed-free-exercise-db.sql`;

    console.log(`\nExecuting: ${command}\n`);

    execSync(command, {
      cwd: serverDir,
      stdio: "inherit",
    });

    console.log("\n======================================");
    console.log("  Seeding Complete!");
    console.log("======================================");

    // Stats
    const byCategory = new Map<string, number>();
    const byType = new Map<string, number>();
    const byLevel = new Map<string, number>();

    for (const ex of exercises) {
      const primaryMuscle = ex.primaryMuscles[0] ?? "other";
      const category = mapPrimaryMuscleToCategory(primaryMuscle);
      const exerciseType = mapToExerciseType(ex.category);

      byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
      byType.set(exerciseType, (byType.get(exerciseType) ?? 0) + 1);
      byLevel.set(ex.level, (byLevel.get(ex.level) ?? 0) + 1);
    }

    console.log(`\nTotal exercises seeded: ${exercises.length}`);

    console.log("\nBy category:");
    for (const [category, count] of [...byCategory.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  - ${category}: ${count}`);
    }

    console.log("\nBy type:");
    for (const [type, count] of [...byType.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  - ${type}: ${count}`);
    }

    console.log("\nBy level:");
    for (const [level, count] of [...byLevel.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  - ${level}: ${count}`);
    }

    // Clean up temp file
    try {
      unlinkSync(tempFile);
      console.log("\nCleaned up temporary SQL file.");
    } catch {
      // Ignore cleanup errors
    }
  } catch (error) {
    console.error("\nSeeding failed:", error);
    process.exit(1);
  }
}

main();
