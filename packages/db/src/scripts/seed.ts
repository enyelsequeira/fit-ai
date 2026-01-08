#!/usr/bin/env tsx
/**
 * Database Seeder Script for Fit AI
 *
 * Usage:
 *   pnpm db:seed         - Seed the database (preserves existing data)
 *   pnpm db:seed:fresh   - Clear existing data and seed fresh
 *
 * This script populates the database with realistic mock data for development
 * and demo purposes.
 */

import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import { resolve } from "node:path";

import * as schema from "../schema";
import { generateSeedData, getTotalRecordCount, type SeedData } from "../seed";
import { log } from "../seed-utils";

// Load environment variables from multiple locations
// Try packages/db first, then apps/server, then root
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), "../../apps/server/.env") });
config({ path: resolve(process.cwd(), "../../.env") });
config({ path: resolve(process.cwd(), "../../.env.local") });

// Parse command line arguments
const args = process.argv.slice(2);
const isFresh = args.includes("--fresh") || args.includes("-f");

// Database connection
const databaseUrl = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL or TURSO_DATABASE_URL environment variable is required");
  console.error("Make sure you have a .env or .env.local file with the database connection string");
  process.exit(1);
}

const client = createClient({
  url: databaseUrl,
  authToken,
});

const db = drizzle(client, { schema });

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Clear all data from the database
 */
async function clearDatabase(): Promise<void> {
  log.header("Clearing existing data...");

  // Delete in reverse order of dependencies
  const tables = [
    "training_summary",
    "muscle_recovery",
    "daily_check_in",
    "progress_photo",
    "personal_record",
    "body_measurement",
    "exercise_set",
    "workout_exercise",
    "workout",
    "workout_template_exercise",
    "workout_template",
    "template_folder",
    "exercise",
    "verification",
    "session",
    "account",
    "user",
  ];

  for (const table of tables) {
    try {
      await client.execute(`DELETE FROM ${table}`);
      log.success(`Cleared ${table}`);
    } catch {
      // Table might not exist, that's okay
      log.info(`Skipped ${table} (may not exist)`);
    }
  }
}

/**
 * Seed users into the database
 */
async function seedUsers(data: SeedData): Promise<void> {
  log.header("Creating users...");

  for (const user of data.users) {
    await db.insert(schema.user).values(user).onConflictDoNothing();
  }

  for (const account of data.accounts) {
    await db.insert(schema.account).values(account).onConflictDoNothing();
  }

  log.success(`Created ${data.users.length} users`);
}

/**
 * Seed exercises into the database
 */
async function seedExercises(data: SeedData): Promise<Map<string, number>> {
  log.header("Creating exercises...");

  const exerciseIdMap = new Map<string, number>();

  for (const exercise of data.exercises) {
    const result = await db
      .insert(schema.exercise)
      .values({
        name: exercise.name,
        description: exercise.description,
        category: exercise.category,
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment,
        exerciseType: exercise.exerciseType,
        isDefault: exercise.isDefault,
        createdByUserId: exercise.createdByUserId,
        // New fields from Free Exercise DB
        primaryImage: exercise.primaryImage,
        images: exercise.images,
        videoUrl: exercise.videoUrl,
        instructions: exercise.instructions,
        externalId: exercise.externalId,
        externalSource: exercise.externalSource,
        level: exercise.level,
        force: exercise.force,
        mechanic: exercise.mechanic,
      })
      .onConflictDoNothing()
      .returning({ id: schema.exercise.id });

    const insertedId = result[0]?.id;
    if (insertedId) {
      exerciseIdMap.set(exercise.name, insertedId);
    } else {
      // Exercise already exists, fetch its ID
      const existing = await db.query.exercise.findFirst({
        where: (ex, { eq }) => eq(ex.name, exercise.name),
      });
      if (existing) {
        exerciseIdMap.set(exercise.name, existing.id);
      }
    }
  }

  log.success(`${exerciseIdMap.size} exercises available`);
  return exerciseIdMap;
}

/**
 * Seed workout templates into the database
 */
async function seedWorkoutTemplates(
  data: SeedData,
  _exerciseIdMap: Map<string, number>,
): Promise<Map<string, number>> {
  log.header("Creating workout templates...");

  const templateIdMap = new Map<string, number>();
  const folderIdMap = new Map<string, number>();

  // Create folders first
  let folderIndex = 0;
  for (const folder of data.templateFolders) {
    const result = await db
      .insert(schema.templateFolder)
      .values(folder)
      .returning({ id: schema.templateFolder.id });

    const insertedId = result[0]?.id;
    if (insertedId) {
      folderIdMap.set(`${folder.userId}-${folderIndex}`, insertedId);
    }
    folderIndex++;
  }

  // Create templates
  for (const template of data.workoutTemplates) {
    const folderId =
      template.folderIndex !== null
        ? folderIdMap.get(`${template.userId}-${template.folderIndex}`)
        : null;

    const result = await db
      .insert(schema.workoutTemplate)
      .values({
        userId: template.userId,
        folderId: folderId ?? null,
        name: template.name,
        description: template.description,
        estimatedDurationMinutes: template.estimatedDurationMinutes,
        isPublic: template.isPublic,
        timesUsed: template.timesUsed,
      })
      .returning({ id: schema.workoutTemplate.id });

    const insertedId = result[0]?.id;
    if (insertedId) {
      templateIdMap.set(template.tempId, insertedId);
    }
  }

  // Create template exercises
  for (const templateEx of data.workoutTemplateExercises) {
    const templateId = templateIdMap.get(templateEx.templateTempId);
    if (!templateId) continue;

    await db.insert(schema.workoutTemplateExercise).values({
      templateId,
      exerciseId: templateEx.exerciseId,
      order: templateEx.order,
      supersetGroupId: templateEx.supersetGroupId,
      notes: templateEx.notes,
      targetSets: templateEx.targetSets,
      targetReps: templateEx.targetReps,
      targetWeight: templateEx.targetWeight,
      restSeconds: templateEx.restSeconds,
    });
  }

  log.success(`Created ${templateIdMap.size} templates`);
  return templateIdMap;
}

/**
 * Seed workouts into the database
 */
async function seedWorkouts(data: SeedData): Promise<Map<string, number>> {
  log.header("Creating workouts...");

  const workoutIdMap = new Map<string, number>();
  const workoutExerciseIdMap = new Map<string, number>();

  // Group workouts by user for better logging
  const workoutsByUser = new Map<string, typeof data.workouts>();
  for (const workout of data.workouts) {
    const existing = workoutsByUser.get(workout.userId) ?? [];
    existing.push(workout);
    workoutsByUser.set(workout.userId, existing);
  }

  for (const [userId, userWorkouts] of workoutsByUser) {
    for (const workout of userWorkouts) {
      const result = await db
        .insert(schema.workout)
        .values({
          userId: workout.userId,
          name: workout.name,
          notes: workout.notes,
          startedAt: workout.startedAt,
          completedAt: workout.completedAt,
          rating: workout.rating,
          mood: workout.mood,
          templateId: workout.templateId,
        })
        .returning({ id: schema.workout.id });

      const insertedId = result[0]?.id;
      if (insertedId) {
        workoutIdMap.set(workout.tempId, insertedId);
      }
    }

    log.success(`Created ${userWorkouts.length} workouts for ${userId}`);
  }

  // Create workout exercises
  let workoutExerciseCount = 0;
  for (const workoutEx of data.workoutExercises) {
    const workoutId = workoutIdMap.get(workoutEx.workoutTempId);
    if (!workoutId) continue;

    const result = await db
      .insert(schema.workoutExercise)
      .values({
        workoutId,
        exerciseId: workoutEx.exerciseId,
        order: workoutEx.order,
        notes: workoutEx.notes,
        supersetGroupId: workoutEx.supersetGroupId,
      })
      .returning({ id: schema.workoutExercise.id });

    const insertedId = result[0]?.id;
    if (insertedId) {
      workoutExerciseIdMap.set(`${workoutEx.workoutTempId}-${workoutExerciseCount}`, insertedId);
    }
    workoutExerciseCount++;
  }

  // Create exercise sets
  let setCount = 0;
  const setsByWorkoutExercise = new Map<number, typeof data.exerciseSets>();

  for (const set of data.exerciseSets) {
    const existing = setsByWorkoutExercise.get(set.workoutExerciseIndex) ?? [];
    existing.push(set);
    setsByWorkoutExercise.set(set.workoutExerciseIndex, existing);
  }

  for (const [workoutExIndex, sets] of setsByWorkoutExercise) {
    const firstSet = sets[0];
    if (!firstSet) continue;

    const workoutExerciseId = workoutExerciseIdMap.get(
      `${firstSet.workoutTempId}-${workoutExIndex}`,
    );
    if (!workoutExerciseId) continue;

    for (const set of sets) {
      await db.insert(schema.exerciseSet).values({
        workoutExerciseId,
        setNumber: set.setNumber,
        reps: set.reps,
        weight: set.weight,
        weightUnit: set.weightUnit,
        setType: set.setType,
        rpe: set.rpe,
        targetReps: set.targetReps,
        targetWeight: set.targetWeight,
        restTimeSeconds: set.restTimeSeconds,
        isCompleted: set.isCompleted,
        completedAt: set.completedAt,
        notes: set.notes,
      });
      setCount++;
    }
  }

  log.success(`Created ${setCount} exercise sets`);
  return workoutIdMap;
}

/**
 * Seed body measurements into the database
 */
async function seedBodyMeasurements(data: SeedData): Promise<void> {
  log.header("Creating body measurements...");

  const measurementsByUser = new Map<string, typeof data.bodyMeasurements>();
  for (const measurement of data.bodyMeasurements) {
    const existing = measurementsByUser.get(measurement.userId) ?? [];
    existing.push(measurement);
    measurementsByUser.set(measurement.userId, existing);
  }

  for (const [userId, measurements] of measurementsByUser) {
    for (const measurement of measurements) {
      await db.insert(schema.bodyMeasurement).values(measurement);
    }
    log.success(`Created ${measurements.length} measurements for ${userId}`);
  }
}

/**
 * Seed personal records into the database
 */
async function seedPersonalRecords(
  data: SeedData,
  workoutIdMap: Map<string, number>,
): Promise<void> {
  log.header("Creating personal records...");

  const recordsByUser = new Map<string, typeof data.personalRecords>();
  for (const record of data.personalRecords) {
    const existing = recordsByUser.get(record.userId) ?? [];
    existing.push(record);
    recordsByUser.set(record.userId, existing);
  }

  for (const [userId, records] of recordsByUser) {
    for (const record of records) {
      const workoutId = record.workoutTempId ? workoutIdMap.get(record.workoutTempId) : null;

      await db.insert(schema.personalRecord).values({
        userId: record.userId,
        exerciseId: record.exerciseId,
        recordType: record.recordType,
        value: record.value,
        displayUnit: record.displayUnit,
        achievedAt: record.achievedAt,
        workoutId: workoutId ?? null,
        notes: record.notes,
      });
    }
    log.success(`Created ${records.length} PRs for ${userId}`);
  }
}

/**
 * Seed progress photos into the database
 */
async function seedProgressPhotos(data: SeedData): Promise<void> {
  log.header("Creating progress photos...");

  const photosByUser = new Map<string, typeof data.progressPhotos>();
  for (const photo of data.progressPhotos) {
    const existing = photosByUser.get(photo.userId) ?? [];
    existing.push(photo);
    photosByUser.set(photo.userId, existing);
  }

  for (const [userId, photos] of photosByUser) {
    for (const photo of photos) {
      await db.insert(schema.progressPhoto).values(photo);
    }
    log.success(`Created ${photos.length} photos for ${userId}`);
  }
}

/**
 * Seed daily check-ins into the database
 */
async function seedDailyCheckIns(data: SeedData): Promise<void> {
  log.header("Creating daily check-ins...");

  const checkInsByUser = new Map<string, typeof data.dailyCheckIns>();
  for (const checkIn of data.dailyCheckIns) {
    const existing = checkInsByUser.get(checkIn.userId) ?? [];
    existing.push(checkIn);
    checkInsByUser.set(checkIn.userId, existing);
  }

  for (const [userId, checkIns] of checkInsByUser) {
    for (const checkIn of checkIns) {
      await db.insert(schema.dailyCheckIn).values(checkIn);
    }
    log.success(`Created ${checkIns.length} check-ins for ${userId}`);
  }
}

/**
 * Seed muscle recovery data into the database
 */
async function seedMuscleRecovery(data: SeedData): Promise<void> {
  log.header("Creating muscle recovery data...");

  for (const recovery of data.muscleRecoveries) {
    await db.insert(schema.muscleRecovery).values(recovery);
  }

  log.success(`Created ${data.muscleRecoveries.length} muscle recovery records`);
}

/**
 * Seed training summaries into the database
 */
async function seedTrainingSummaries(data: SeedData): Promise<void> {
  log.header("Creating training summaries...");

  for (const summary of data.trainingSummaries) {
    await db.insert(schema.trainingSummary).values(summary);
  }

  log.success(`Created ${data.trainingSummaries.length} training summaries`);
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main(): Promise<void> {
  console.log("\n======================================");
  console.log("  Fit AI Database Seeder");
  console.log("======================================\n");

  try {
    // Clear database if --fresh flag is provided
    if (isFresh) {
      await clearDatabase();
    }

    // Generate all seed data
    const data = generateSeedData();

    // Seed data in order of dependencies
    await seedUsers(data);
    const exerciseIdMap = await seedExercises(data);
    await seedWorkoutTemplates(data, exerciseIdMap);
    const workoutIdMap = await seedWorkouts(data);
    await seedBodyMeasurements(data);
    await seedPersonalRecords(data, workoutIdMap);
    await seedProgressPhotos(data);
    await seedDailyCheckIns(data);
    await seedMuscleRecovery(data);
    await seedTrainingSummaries(data);

    // Print summary
    const totalRecords = getTotalRecordCount(data);

    console.log("\n======================================");
    console.log("  Seeding Complete!");
    console.log("======================================");
    console.log(`\n  Total records created: ${totalRecords}`);
    console.log("\n  Test accounts:");
    console.log("  - test@example.com (main test user)");
    console.log("  - beginner@example.com (new user)");
    console.log("  - advanced@example.com (experienced)");
    console.log("  - coach@example.com (trainer)");
    console.log("\n  Password for all accounts: password123\n");
  } catch (error) {
    console.error("\nSeeding failed:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();
