#!/usr/bin/env tsx
/**
 * Seed Exercises to D1 Database via Wrangler
 *
 * Usage:
 *   pnpm db:seed:exercises         - Seed exercises to local D1 database
 *   pnpm db:seed:exercises:remote  - Seed exercises to remote D1 database
 *
 * This script populates the database with exercises that include images
 * and instructions from the Free Exercise DB.
 */

import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultExercises } from "../seed/exercises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const isRemote = args.includes("--remote") || args.includes("-r");
const clearFirst = args.includes("--fresh") || args.includes("-f");

const serverDir = resolve(__dirname, "../../../../apps/server");

/**
 * Generate SQL for all exercises
 */
function generateExercisesSQL(): string {
  const statements: string[] = [];

  // Note: We cannot delete exercises that are referenced by workouts due to foreign key constraints.
  // Instead, we'll insert new exercises and update existing ones.

  // Insert each exercise, ignoring conflicts (existing exercises won't be duplicated)
  for (const ex of defaultExercises) {
    const muscleGroupsJSON = JSON.stringify(ex.muscleGroups).replace(/'/g, "''");
    const imagesJSON = JSON.stringify(ex.images).replace(/'/g, "''");
    const instructionsJSON = JSON.stringify(ex.instructions).replace(/'/g, "''");
    const externalId = ex.externalId ? `'${ex.externalId}'` : "NULL";
    const externalSource = ex.externalSource ? `'${ex.externalSource}'` : "NULL";
    const primaryImage = ex.primaryImage ? `'${ex.primaryImage.replace(/'/g, "''")}'` : "NULL";
    const level = ex.level ? `'${ex.level}'` : "NULL";
    const force = ex.force ? `'${ex.force}'` : "NULL";
    const mechanic = ex.mechanic ? `'${ex.mechanic}'` : "NULL";
    const name = ex.name.replace(/'/g, "''");
    const description = ex.description.replace(/'/g, "''");

    // First, try to insert the exercise (will be ignored if name already exists due to unique constraint on name)
    statements.push(`INSERT OR IGNORE INTO exercise (
  name, description, category, muscle_groups, equipment, exercise_type,
  is_default, created_by_user_id, primary_image, images, video_url,
  instructions, external_id, external_source, level, force, mechanic
) VALUES (
  '${name}',
  '${description}',
  '${ex.category}',
  '${muscleGroupsJSON}',
  '${ex.equipment}',
  '${ex.exerciseType}',
  1,
  NULL,
  ${primaryImage},
  '${imagesJSON}',
  NULL,
  '${instructionsJSON}',
  ${externalId},
  ${externalSource},
  ${level},
  ${force},
  ${mechanic}
);`);

    // Then, update the exercise with new image/instruction data if it already exists
    statements.push(`UPDATE exercise SET
  description = '${description}',
  category = '${ex.category}',
  muscle_groups = '${muscleGroupsJSON}',
  equipment = '${ex.equipment}',
  exercise_type = '${ex.exerciseType}',
  is_default = 1,
  primary_image = ${primaryImage},
  images = '${imagesJSON}',
  instructions = '${instructionsJSON}',
  external_id = ${externalId},
  external_source = ${externalSource},
  level = ${level},
  force = ${force},
  mechanic = ${mechanic}
WHERE name = '${name}' AND is_default = 1;`);
  }

  return statements.join("\n\n");
}

async function main(): Promise<void> {
  console.log("\n======================================");
  console.log("  Fit AI Exercise Seeder (D1)");
  console.log("======================================\n");

  const mode = isRemote ? "REMOTE" : "LOCAL";
  console.log(`Mode: ${mode}`);
  console.log(`Total exercises to seed: ${defaultExercises.length}`);

  if (clearFirst) {
    console.log("Will clear existing default exercises first.\n");
  }

  // Generate SQL
  const sql = generateExercisesSQL();

  // Write to temp file
  const tempFile = resolve(serverDir, "seed-exercises.sql");
  writeFileSync(tempFile, sql, "utf-8");
  console.log(`Generated SQL file: ${tempFile}`);

  try {
    // Execute via wrangler
    const remoteFlag = isRemote ? "--remote" : "--local";
    const command = `pnpm wrangler d1 execute fit-ai-database-enyelsequeira ${remoteFlag} --file=seed-exercises.sql`;

    console.log(`\nExecuting: ${command}\n`);

    execSync(command, {
      cwd: serverDir,
      stdio: "inherit",
    });

    console.log("\n======================================");
    console.log("  Seeding Complete!");
    console.log("======================================");
    console.log(`\nSeeded ${defaultExercises.length} exercises with images and instructions.`);

    // Count exercises by category
    const byCategory = new Map<string, number>();
    for (const ex of defaultExercises) {
      byCategory.set(ex.category, (byCategory.get(ex.category) ?? 0) + 1);
    }

    console.log("\nExercises by category:");
    for (const [category, count] of byCategory) {
      console.log(`  - ${category}: ${count}`);
    }

    // Count exercises with images
    const withImages = defaultExercises.filter((ex) => ex.primaryImage !== null).length;
    console.log(`\nExercises with images: ${withImages}/${defaultExercises.length}`);
  } catch (error) {
    console.error("\nSeeding failed:", error);
    process.exit(1);
  } finally {
    // Clean up temp file
    try {
      unlinkSync(tempFile);
      console.log("\nCleaned up temporary SQL file.");
    } catch {
      // Ignore cleanup errors
    }
  }
}

main();
