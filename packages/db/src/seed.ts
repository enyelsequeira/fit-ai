/**
 * Comprehensive Mock Data Seeder for Fit AI
 *
 * Generates realistic fitness tracking data including:
 * - Users with different experience levels
 * - Workouts with progressive overload
 * - Body measurements with realistic trends
 * - Personal records
 * - Progress photos
 * - Daily check-ins
 * - Workout templates
 */

import type { ExerciseCategory, ExerciseType } from "./schema/exercise";
import type { RecordType } from "./schema/personal-record";
import type { PoseType } from "./schema/progress-photo";
import type { MoodType, MuscleGroupType } from "./schema/recovery";
import type { SetType, WeightUnit, WorkoutMood } from "./schema/workout";

import { defaultExercises } from "./seed/exercises";
import {
  addDays,
  addMinutes,
  calculate1RM,
  formatDate,
  generateBodyFat,
  generateBodyWeight,
  generateDailyMood,
  generateId,
  generateRPE,
  generateWorkoutDuration,
  generateWorkoutMood,
  generateWorkoutName,
  getExerciseBaseWeight,
  getWeekNumber,
  log,
  progressiveWeight,
  randomBetween,
  randomFloatBetween,
  randomFromArray,
  randomSubset,
  realisticReps,
  shouldCompleteWorkout,
  type WorkoutType,
} from "./seed-utils";

// ============================================================================
// Types
// ============================================================================

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  goal: "cut" | "bulk" | "maintain";
  startWeight: number;
  startBodyFat: number;
  adherenceRate: number;
  workoutsPerWeek: number;
  dataMonths: number;
};

export type ExerciseRecord = {
  id: number;
  name: string;
  category: ExerciseCategory;
  muscleGroups: string[];
  equipment: string;
  exerciseType: ExerciseType;
};

type GeneratedUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type GeneratedAccount = {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

type GeneratedExercise = {
  name: string;
  description: string;
  category: ExerciseCategory;
  muscleGroups: string[];
  equipment: string;
  exerciseType: ExerciseType;
  isDefault: boolean;
  createdByUserId: string | null;
  // New fields from Free Exercise DB
  primaryImage: string | null;
  images: string[];
  videoUrl: string | null;
  instructions: string[];
  externalId: string | null;
  externalSource: "free-exercise-db" | null;
  level: "beginner" | "intermediate" | "expert" | null;
  force: "push" | "pull" | "static" | null;
  mechanic: "compound" | "isolation" | null;
};

type GeneratedWorkout = {
  id: number;
  tempId: string;
  userId: string;
  name: string | null;
  notes: string | null;
  startedAt: Date;
  completedAt: Date | null;
  rating: number | null;
  mood: WorkoutMood | null;
  templateId: number | null;
};

type GeneratedWorkoutExercise = {
  workoutTempId: string;
  exerciseId: number;
  order: number;
  notes: string | null;
  supersetGroupId: number | null;
};

type GeneratedExerciseSet = {
  workoutExerciseIndex: number;
  workoutTempId: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  weightUnit: WeightUnit;
  setType: SetType;
  rpe: number | null;
  targetReps: number | null;
  targetWeight: number | null;
  restTimeSeconds: number | null;
  isCompleted: boolean;
  completedAt: Date | null;
  notes: string | null;
};

type GeneratedBodyMeasurement = {
  userId: string;
  measuredAt: Date;
  weight: number | null;
  weightUnit: "kg" | "lb";
  bodyFatPercentage: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  leftArm: number | null;
  rightArm: number | null;
  leftThigh: number | null;
  rightThigh: number | null;
  neck: number | null;
  shoulders: number | null;
  lengthUnit: "cm" | "in";
  notes: string | null;
};

type GeneratedPersonalRecord = {
  userId: string;
  exerciseId: number;
  recordType: RecordType;
  value: number;
  displayUnit: string | null;
  achievedAt: Date;
  workoutTempId: string | null;
  notes: string | null;
};

type GeneratedProgressPhoto = {
  userId: string;
  photoUrl: string;
  thumbnailUrl: string | null;
  takenAt: Date;
  poseType: PoseType;
  isPrivate: boolean;
  notes: string | null;
};

type GeneratedDailyCheckIn = {
  userId: string;
  date: string;
  sleepHours: number | null;
  sleepQuality: number | null;
  energyLevel: number | null;
  stressLevel: number | null;
  sorenessLevel: number | null;
  soreAreas: string[] | null;
  motivationLevel: number | null;
  mood: MoodType | null;
  nutritionQuality: number | null;
  hydrationLevel: number | null;
  notes: string | null;
};

type GeneratedMuscleRecovery = {
  userId: string;
  muscleGroup: MuscleGroupType;
  recoveryScore: number;
  fatigueLevel: number;
  lastWorkedAt: Date | null;
  setsLast7Days: number;
  volumeLast7Days: number;
  estimatedFullRecovery: Date | null;
};

type GeneratedTemplateFolder = {
  userId: string;
  name: string;
  order: number;
};

type GeneratedWorkoutTemplate = {
  tempId: string;
  userId: string;
  folderIndex: number | null;
  name: string;
  description: string | null;
  estimatedDurationMinutes: number | null;
  isPublic: boolean;
  timesUsed: number;
};

type GeneratedWorkoutTemplateExercise = {
  templateTempId: string;
  exerciseId: number;
  order: number;
  supersetGroupId: number | null;
  notes: string | null;
  targetSets: number;
  targetReps: string | null;
  targetWeight: number | null;
  restSeconds: number;
};

type GeneratedTrainingSummary = {
  userId: string;
  periodType: "week" | "month";
  periodStart: string;
  periodEnd: string;
  totalWorkouts: number;
  completedWorkouts: number;
  totalDurationMinutes: number;
  totalSets: number;
  totalReps: number;
  totalVolumeKg: number;
  volumeByMuscle: Record<string, number>;
  setsByMuscle: Record<string, number>;
  uniqueExercises: number;
  prsAchieved: number;
  avgWorkoutDuration: number | null;
  avgRpe: number | null;
  avgSetsPerWorkout: number | null;
  completionRate: number | null;
};

// ============================================================================
// User Profiles
// ============================================================================

export const userProfiles: UserProfile[] = [
  {
    id: "user_test_main",
    email: "test@example.com",
    name: "Alex Fitness",
    experienceLevel: "intermediate",
    goal: "cut",
    startWeight: 82,
    startBodyFat: 18,
    adherenceRate: 0.85,
    workoutsPerWeek: 4,
    dataMonths: 3,
  },
  {
    id: "user_beginner",
    email: "beginner@example.com",
    name: "Jordan Newbie",
    experienceLevel: "beginner",
    goal: "bulk",
    startWeight: 68,
    startBodyFat: 22,
    adherenceRate: 0.6,
    workoutsPerWeek: 3,
    dataMonths: 1,
  },
  {
    id: "user_advanced",
    email: "advanced@example.com",
    name: "Sam Strong",
    experienceLevel: "advanced",
    goal: "maintain",
    startWeight: 90,
    startBodyFat: 12,
    adherenceRate: 0.95,
    workoutsPerWeek: 5,
    dataMonths: 3,
  },
  {
    id: "user_coach",
    email: "coach@example.com",
    name: "Coach Williams",
    experienceLevel: "advanced",
    goal: "maintain",
    startWeight: 85,
    startBodyFat: 14,
    adherenceRate: 0.9,
    workoutsPerWeek: 4,
    dataMonths: 2,
  },
];

// ============================================================================
// Workout Type Definitions
// ============================================================================

type WorkoutTypeDefinition = {
  type: WorkoutType;
  exerciseCategories: ExerciseCategory[];
  exerciseCount: [number, number];
  setsPerExercise: [number, number];
};

const workoutTypes: WorkoutTypeDefinition[] = [
  {
    type: "push",
    exerciseCategories: ["chest", "shoulders", "arms"],
    exerciseCount: [5, 7],
    setsPerExercise: [3, 5],
  },
  {
    type: "pull",
    exerciseCategories: ["back", "arms"],
    exerciseCount: [5, 7],
    setsPerExercise: [3, 5],
  },
  {
    type: "legs",
    exerciseCategories: ["legs", "core"],
    exerciseCount: [5, 8],
    setsPerExercise: [3, 5],
  },
  {
    type: "upper",
    exerciseCategories: ["chest", "back", "shoulders", "arms"],
    exerciseCount: [6, 8],
    setsPerExercise: [3, 4],
  },
  {
    type: "lower",
    exerciseCategories: ["legs", "core"],
    exerciseCount: [5, 7],
    setsPerExercise: [3, 5],
  },
  {
    type: "fullBody",
    exerciseCategories: ["chest", "back", "legs", "shoulders", "core"],
    exerciseCount: [6, 10],
    setsPerExercise: [2, 4],
  },
];

// ============================================================================
// Data Generation Functions
// ============================================================================

/**
 * Generate user records
 */
export function generateUsers(): GeneratedUser[] {
  return userProfiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    emailVerified: true,
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
    createdAt: addDays(new Date(), -profile.dataMonths * 30),
    updatedAt: new Date(),
  }));
}

/**
 * Generate accounts for users (credential-based auth)
 */
export function generateAccounts(): GeneratedAccount[] {
  // Password hash for "password123" - in real app this would be properly hashed
  const passwordHash = "$2a$10$mockhashedpasswordforseeding";

  return userProfiles.map((profile) => ({
    id: `account_${profile.id}`,
    accountId: profile.id,
    providerId: "credential",
    userId: profile.id,
    password: passwordHash,
    createdAt: addDays(new Date(), -profile.dataMonths * 30),
    updatedAt: new Date(),
  }));
}

/**
 * Generate default exercises with images and instructions from Free Exercise DB
 */
export function generateExercises(): GeneratedExercise[] {
  return defaultExercises.map((ex) => ({
    name: ex.name,
    description: ex.description,
    category: ex.category,
    muscleGroups: ex.muscleGroups,
    equipment: ex.equipment,
    exerciseType: ex.exerciseType,
    isDefault: true,
    createdByUserId: null,
    // New fields from Free Exercise DB
    primaryImage: ex.primaryImage,
    images: ex.images,
    videoUrl: null,
    instructions: ex.instructions,
    externalId: ex.externalId,
    externalSource: ex.externalSource,
    level: ex.level,
    force: ex.force,
    mechanic: ex.mechanic,
  }));
}

/**
 * Generate workout templates for a user
 */
export function generateWorkoutTemplates(
  profile: UserProfile,
  exercises: ExerciseRecord[],
): {
  folders: GeneratedTemplateFolder[];
  templates: GeneratedWorkoutTemplate[];
  templateExercises: GeneratedWorkoutTemplateExercise[];
} {
  const folders: GeneratedTemplateFolder[] = [
    { userId: profile.id, name: "Push/Pull/Legs", order: 0 },
    { userId: profile.id, name: "Full Body", order: 1 },
    { userId: profile.id, name: "Custom", order: 2 },
  ];

  const templates: GeneratedWorkoutTemplate[] = [];
  const templateExercises: GeneratedWorkoutTemplateExercise[] = [];

  // PPL Templates
  const pplTemplates: { name: string; type: WorkoutType; folderIndex: number }[] = [
    { name: "Push Day A - Chest Focus", type: "push", folderIndex: 0 },
    { name: "Pull Day A - Back Focus", type: "pull", folderIndex: 0 },
    { name: "Leg Day A - Quad Focus", type: "legs", folderIndex: 0 },
    { name: "Push Day B - Shoulder Focus", type: "push", folderIndex: 0 },
    { name: "Pull Day B - Upper Back Focus", type: "pull", folderIndex: 0 },
    { name: "Leg Day B - Hamstring Focus", type: "legs", folderIndex: 0 },
  ];

  // Full Body Templates
  const fullBodyTemplates: { name: string; type: WorkoutType; folderIndex: number }[] = [
    { name: "Full Body A", type: "fullBody", folderIndex: 1 },
    { name: "Full Body B", type: "fullBody", folderIndex: 1 },
  ];

  const allTemplateConfigs = [...pplTemplates, ...fullBodyTemplates];

  for (const config of allTemplateConfigs) {
    const tempId = generateId();
    const workoutTypeDef = workoutTypes.find((wt) => wt.type === config.type);
    if (!workoutTypeDef) continue;

    // Find exercises for this workout type
    const categoryExercises = exercises.filter((ex) =>
      workoutTypeDef.exerciseCategories.includes(ex.category),
    );

    const selectedExercises = randomSubset(
      categoryExercises,
      randomBetween(workoutTypeDef.exerciseCount[0], workoutTypeDef.exerciseCount[1]),
    );

    templates.push({
      tempId,
      userId: profile.id,
      folderIndex: config.folderIndex,
      name: config.name,
      description: `${config.type.charAt(0).toUpperCase() + config.type.slice(1)} workout template`,
      estimatedDurationMinutes: generateWorkoutDuration(config.type),
      isPublic: false,
      timesUsed: randomBetween(5, 20),
    });

    // Add exercises to template
    selectedExercises.forEach((ex, index) => {
      const targetSets = randomBetween(
        workoutTypeDef.setsPerExercise[0],
        workoutTypeDef.setsPerExercise[1],
      );
      const targetWeight = getExerciseBaseWeight(ex.name, profile.experienceLevel);

      templateExercises.push({
        templateTempId: tempId,
        exerciseId: ex.id,
        order: index + 1,
        supersetGroupId: null,
        notes: null,
        targetSets,
        targetReps: ex.exerciseType === "strength" ? "8-12" : null,
        targetWeight: targetWeight > 0 ? targetWeight : null,
        restSeconds: ex.exerciseType === "strength" ? randomBetween(60, 120) : 30,
      });
    });
  }

  return { folders, templates, templateExercises };
}

/**
 * Generate workouts for a user over their data period
 */
export function generateWorkouts(
  profile: UserProfile,
  exercises: ExerciseRecord[],
  startDate: Date,
): {
  workouts: GeneratedWorkout[];
  workoutExercises: GeneratedWorkoutExercise[];
  exerciseSets: GeneratedExerciseSet[];
} {
  const workouts: GeneratedWorkout[] = [];
  const workoutExercises: GeneratedWorkoutExercise[] = [];
  const exerciseSets: GeneratedExerciseSet[] = [];

  const endDate = new Date();
  let currentDate = new Date(startDate);
  let workoutId = 0;
  let workoutExerciseIndex = 0;

  // Define weekly schedule based on workouts per week
  const weeklySchedules: Record<number, number[]> = {
    3: [1, 3, 5], // Mon, Wed, Fri
    4: [1, 2, 4, 5], // Mon, Tue, Thu, Fri
    5: [1, 2, 3, 5, 6], // Mon-Wed, Fri-Sat
  };

  const schedule = weeklySchedules[profile.workoutsPerWeek] ?? [1, 3, 5];
  const workoutRotation: WorkoutType[] =
    profile.workoutsPerWeek >= 4 ? ["push", "pull", "legs", "push", "pull", "legs"] : ["fullBody"];

  let rotationIndex = 0;

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    // Check if this is a workout day
    if (schedule.includes(dayOfWeek)) {
      // Check adherence
      if (shouldCompleteWorkout(profile.adherenceRate)) {
        const workoutType = workoutRotation[rotationIndex % workoutRotation.length] ?? "fullBody";
        const workoutTypeDef = workoutTypes.find((wt) => wt.type === workoutType);

        if (workoutTypeDef) {
          const tempId = generateId();
          const weekNumber = getWeekNumber(currentDate, startDate);
          const duration = generateWorkoutDuration(workoutType);
          const isCompleted = Math.random() > 0.1; // 90% completion rate

          // Set workout time (morning or evening)
          const workoutHour = Math.random() > 0.5 ? randomBetween(6, 9) : randomBetween(17, 20);
          const workoutStart = new Date(currentDate);
          workoutStart.setHours(workoutHour, randomBetween(0, 59), 0, 0);

          workouts.push({
            id: workoutId,
            tempId,
            userId: profile.id,
            name: generateWorkoutName(workoutType),
            notes: Math.random() > 0.7 ? randomFromArray(workoutNotes) : null,
            startedAt: workoutStart,
            completedAt: isCompleted ? addMinutes(workoutStart, duration) : null,
            rating: isCompleted ? randomBetween(3, 5) : null,
            mood: isCompleted ? generateWorkoutMood() : null,
            templateId: null,
          });

          // Get exercises for this workout
          const categoryExercises = exercises.filter((ex) =>
            workoutTypeDef.exerciseCategories.includes(ex.category),
          );

          const selectedExercises = randomSubset(
            categoryExercises,
            randomBetween(workoutTypeDef.exerciseCount[0], workoutTypeDef.exerciseCount[1]),
          );

          // Add exercises and sets
          selectedExercises.forEach((ex, exIndex) => {
            workoutExercises.push({
              workoutTempId: tempId,
              exerciseId: ex.id,
              order: exIndex + 1,
              notes: null,
              supersetGroupId: null,
            });

            // Generate sets for this exercise
            const numSets = randomBetween(
              workoutTypeDef.setsPerExercise[0],
              workoutTypeDef.setsPerExercise[1],
            );
            const baseWeight = getExerciseBaseWeight(ex.name, profile.experienceLevel);
            const currentWeight = progressiveWeight(baseWeight, weekNumber, 1.5);

            for (let setNum = 1; setNum <= numSets; setNum++) {
              let setType: SetType = "normal";
              let setWeight = currentWeight;
              let targetReps = 8;

              // First set might be warmup
              if (setNum === 1 && Math.random() > 0.5) {
                setType = "warmup";
                setWeight = currentWeight * 0.5;
                targetReps = 12;
              }
              // Last set might be failure or drop
              else if (setNum === numSets && Math.random() > 0.7) {
                setType = Math.random() > 0.5 ? "failure" : "drop";
                if (setType === "drop") {
                  setWeight = currentWeight * 0.7;
                }
              }

              const actualReps = realisticReps(targetReps, 2);
              const setCompleted = isCompleted || Math.random() > 0.2;

              exerciseSets.push({
                workoutExerciseIndex,
                workoutTempId: tempId,
                setNumber: setNum,
                reps: setCompleted ? actualReps : null,
                weight: ex.exerciseType === "strength" ? Math.round(setWeight) : null,
                weightUnit: "kg",
                setType,
                rpe: setCompleted ? generateRPE(setType, setNum, numSets) : null,
                targetReps,
                targetWeight: ex.exerciseType === "strength" ? currentWeight : null,
                restTimeSeconds: setNum < numSets ? randomBetween(60, 180) : null,
                isCompleted: setCompleted,
                completedAt: setCompleted
                  ? addMinutes(workoutStart, setNum * 3 + exIndex * 10)
                  : null,
                notes: null,
              });
            }

            workoutExerciseIndex++;
          });

          workoutId++;
        }
      }

      rotationIndex++;
    }

    currentDate = addDays(currentDate, 1);
  }

  return { workouts, workoutExercises, exerciseSets };
}

/**
 * Generate body measurements for a user
 */
export function generateBodyMeasurements(
  profile: UserProfile,
  startDate: Date,
): GeneratedBodyMeasurement[] {
  const measurements: GeneratedBodyMeasurement[] = [];
  const endDate = new Date();
  let currentDate = new Date(startDate);

  // Measure weekly on Sundays
  while (currentDate <= endDate) {
    if (currentDate.getDay() === 0) {
      // Sunday
      const weekNumber = getWeekNumber(currentDate, startDate);
      const weight = generateBodyWeight(profile.startWeight, weekNumber, profile.goal);
      const bodyFat = generateBodyFat(profile.startBodyFat, weekNumber, profile.goal);

      // Base measurements that change slightly with weight
      const weightFactor = weight / profile.startWeight;

      measurements.push({
        userId: profile.id,
        measuredAt: new Date(currentDate.setHours(8, 0, 0, 0)),
        weight,
        weightUnit: "kg",
        bodyFatPercentage: bodyFat,
        chest: Math.round(98 * weightFactor + randomFloatBetween(-0.5, 0.5)),
        waist: Math.round(
          (profile.goal === "cut" ? 82 - weekNumber * 0.3 : 82 + weekNumber * 0.1) +
            randomFloatBetween(-0.5, 0.5),
        ),
        hips: Math.round(96 * weightFactor + randomFloatBetween(-0.5, 0.5)),
        leftArm: Math.round(35 + weekNumber * 0.15 + randomFloatBetween(-0.3, 0.3)),
        rightArm: Math.round(35.5 + weekNumber * 0.15 + randomFloatBetween(-0.3, 0.3)),
        leftThigh: Math.round(58 * weightFactor + randomFloatBetween(-0.5, 0.5)),
        rightThigh: Math.round(58.5 * weightFactor + randomFloatBetween(-0.5, 0.5)),
        neck: Math.round(38 + randomFloatBetween(-0.3, 0.3)),
        shoulders: Math.round(118 + weekNumber * 0.1 + randomFloatBetween(-0.5, 0.5)),
        lengthUnit: "cm",
        notes:
          Math.random() > 0.8
            ? randomFromArray([
                "Morning measurement after bathroom",
                "Feeling leaner this week",
                "Good progress!",
                "Waist looking tighter",
              ])
            : null,
      });
    }

    currentDate = addDays(currentDate, 1);
  }

  return measurements;
}

/**
 * Generate personal records for a user
 */
export function generatePersonalRecords(
  profile: UserProfile,
  exercises: ExerciseRecord[],
  workouts: GeneratedWorkout[],
): GeneratedPersonalRecord[] {
  const records: GeneratedPersonalRecord[] = [];

  // Key exercises for PRs
  const prExercises = exercises.filter((ex) =>
    [
      "Barbell Bench Press",
      "Barbell Squat",
      "Barbell Deadlift",
      "Overhead Press",
      "Bent Over Barbell Row",
      "Pull-up",
    ].includes(ex.name),
  );

  for (const ex of prExercises) {
    const baseWeight = getExerciseBaseWeight(ex.name, profile.experienceLevel);

    // Generate 3-6 PRs over time showing progression
    const numPRs = randomBetween(3, 6);
    const workoutSubset = workouts.filter((w) => w.completedAt !== null);

    for (let i = 0; i < numPRs && i < workoutSubset.length; i++) {
      const workout = workoutSubset[Math.floor((i / numPRs) * workoutSubset.length)];
      if (!workout?.completedAt) continue;

      const weekNumber = getWeekNumber(workout.completedAt, workouts[0]?.startedAt ?? new Date());
      const prWeight = progressiveWeight(baseWeight, weekNumber * (i + 1) * 0.3, 2);

      // 1RM PR
      records.push({
        userId: profile.id,
        exerciseId: ex.id,
        recordType: "one_rep_max",
        value: calculate1RM(prWeight, randomBetween(3, 8)),
        displayUnit: "kg",
        achievedAt: workout.completedAt,
        workoutTempId: workout.tempId,
        notes: i === numPRs - 1 ? "Current PR!" : null,
      });

      // Max weight PR (less frequently)
      if (i % 2 === 0) {
        records.push({
          userId: profile.id,
          exerciseId: ex.id,
          recordType: "max_weight",
          value: prWeight + randomBetween(5, 15),
          displayUnit: "kg",
          achievedAt: workout.completedAt,
          workoutTempId: workout.tempId,
          notes: null,
        });
      }
    }
  }

  return records;
}

/**
 * Generate progress photos for a user
 */
export function generateProgressPhotos(
  profile: UserProfile,
  startDate: Date,
): GeneratedProgressPhoto[] {
  const photos: GeneratedProgressPhoto[] = [];
  const poses: PoseType[] = ["front", "side", "back"];
  const endDate = new Date();
  let currentDate = new Date(startDate);
  let photoIndex = 0;

  // Monthly progress photos
  while (currentDate <= endDate) {
    // Take photos on the 1st of each month
    if (currentDate.getDate() === 1 || photoIndex === 0) {
      const weekNumber = getWeekNumber(currentDate, startDate);

      for (const pose of poses) {
        photos.push({
          userId: profile.id,
          photoUrl: `https://placeholder.com/progress/${profile.id}/${formatDate(currentDate)}/${pose}.jpg`,
          thumbnailUrl: `https://placeholder.com/progress/${profile.id}/${formatDate(currentDate)}/${pose}_thumb.jpg`,
          takenAt: new Date(currentDate.setHours(8, 0, 0, 0)),
          poseType: pose,
          isPrivate: true,
          notes: photoIndex === 0 ? "Starting point" : `Week ${weekNumber} progress - ${pose} pose`,
        });
      }

      photoIndex++;
      currentDate = addDays(currentDate, 28); // Jump to next month approximately
    } else {
      currentDate = addDays(currentDate, 1);
    }
  }

  return photos;
}

/**
 * Generate daily check-ins for a user
 */
export function generateDailyCheckIns(
  profile: UserProfile,
  workouts: GeneratedWorkout[],
): GeneratedDailyCheckIn[] {
  const checkIns: GeneratedDailyCheckIn[] = [];
  const endDate = new Date();
  const startDate = addDays(endDate, -30); // Last 30 days
  let currentDate = new Date(startDate);

  // Track which days had leg workouts
  const legWorkoutDays = new Set(
    workouts
      .filter(
        (w) => w.name?.toLowerCase().includes("leg") || w.name?.toLowerCase().includes("lower"),
      )
      .map((w) => formatDate(w.startedAt)),
  );

  while (currentDate <= endDate) {
    const dateStr = formatDate(currentDate);
    const hadLegDayYesterday = legWorkoutDays.has(formatDate(addDays(currentDate, -1)));
    const hadWorkoutToday = workouts.some((w) => formatDate(w.startedAt) === dateStr);

    checkIns.push({
      userId: profile.id,
      date: dateStr,
      sleepHours: randomFloatBetween(5.5, 9, 1),
      sleepQuality: randomBetween(2, 5),
      energyLevel: hadLegDayYesterday ? randomBetween(4, 6) : randomBetween(6, 9),
      stressLevel: randomBetween(2, 7),
      sorenessLevel: hadLegDayYesterday ? randomBetween(5, 8) : randomBetween(1, 4),
      soreAreas: hadLegDayYesterday ? ["quadriceps", "hamstrings", "glutes"] : null,
      motivationLevel: hadWorkoutToday ? randomBetween(7, 10) : randomBetween(5, 8),
      mood: generateDailyMood(),
      nutritionQuality: randomBetween(2, 5),
      hydrationLevel: randomBetween(2, 5),
      notes: Math.random() > 0.9 ? randomFromArray(checkInNotes) : null,
    });

    currentDate = addDays(currentDate, 1);
  }

  return checkIns;
}

/**
 * Generate muscle recovery data for a user
 */
export function generateMuscleRecovery(
  profile: UserProfile,
  workouts: GeneratedWorkout[],
): GeneratedMuscleRecovery[] {
  const muscleGroups: MuscleGroupType[] = [
    "chest",
    "back",
    "shoulders",
    "biceps",
    "triceps",
    "forearms",
    "abs",
    "quadriceps",
    "hamstrings",
    "glutes",
    "calves",
  ];

  const now = new Date();

  return muscleGroups.map((muscle) => {
    // Calculate based on recent workout activity
    const recentWorkouts = workouts.filter(
      (w) => w.completedAt && w.completedAt > addDays(now, -7),
    );

    const isRecentlyWorked = recentWorkouts.some(
      (w) =>
        (muscle === "chest" && w.name?.toLowerCase().includes("push")) ||
        (muscle === "back" && w.name?.toLowerCase().includes("pull")) ||
        (["quadriceps", "hamstrings", "glutes", "calves"].includes(muscle) &&
          w.name?.toLowerCase().includes("leg")),
    );

    const lastWorkout = workouts
      .filter(
        (w) =>
          w.completedAt &&
          ((muscle === "chest" && w.name?.toLowerCase().includes("push")) ||
            (muscle === "back" && w.name?.toLowerCase().includes("pull")) ||
            (["quadriceps", "hamstrings", "glutes", "calves"].includes(muscle) &&
              w.name?.toLowerCase().includes("leg"))),
      )
      .sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0))[0];

    return {
      userId: profile.id,
      muscleGroup: muscle,
      recoveryScore: isRecentlyWorked ? randomBetween(40, 70) : randomBetween(80, 100),
      fatigueLevel: isRecentlyWorked ? randomBetween(30, 60) : randomBetween(0, 20),
      lastWorkedAt: lastWorkout?.completedAt ?? null,
      setsLast7Days: isRecentlyWorked ? randomBetween(12, 24) : randomBetween(0, 8),
      volumeLast7Days: isRecentlyWorked ? randomBetween(5000, 15000) : randomBetween(0, 3000),
      estimatedFullRecovery: isRecentlyWorked ? addDays(now, randomBetween(1, 3)) : null,
    };
  });
}

/**
 * Generate training summaries for a user
 */
export function generateTrainingSummaries(
  profile: UserProfile,
  workouts: GeneratedWorkout[],
  startDate: Date,
): GeneratedTrainingSummary[] {
  const summaries: GeneratedTrainingSummary[] = [];
  const endDate = new Date();
  let currentDate = new Date(startDate);

  // Generate weekly summaries
  while (currentDate <= endDate) {
    const weekEnd = addDays(currentDate, 6);
    const weekWorkouts = workouts.filter(
      (w) => w.startedAt >= currentDate && w.startedAt <= weekEnd,
    );

    const completedWorkouts = weekWorkouts.filter((w) => w.completedAt !== null);
    const totalSets = completedWorkouts.length * randomBetween(20, 35);
    const totalReps = totalSets * randomBetween(8, 12);
    const avgWeight = getExerciseBaseWeight("Barbell Bench Press", profile.experienceLevel);

    summaries.push({
      userId: profile.id,
      periodType: "week",
      periodStart: formatDate(currentDate),
      periodEnd: formatDate(weekEnd),
      totalWorkouts: weekWorkouts.length,
      completedWorkouts: completedWorkouts.length,
      totalDurationMinutes: completedWorkouts.reduce(
        (sum, w) =>
          sum +
          (w.completedAt
            ? Math.round((w.completedAt.getTime() - w.startedAt.getTime()) / 60000)
            : 0),
        0,
      ),
      totalSets,
      totalReps,
      totalVolumeKg: totalReps * avgWeight * 0.5,
      volumeByMuscle: {
        chest: randomBetween(2000, 5000),
        back: randomBetween(2000, 5000),
        legs: randomBetween(3000, 8000),
        shoulders: randomBetween(1000, 3000),
        arms: randomBetween(1000, 2500),
      },
      setsByMuscle: {
        chest: randomBetween(9, 15),
        back: randomBetween(9, 15),
        legs: randomBetween(12, 20),
        shoulders: randomBetween(6, 12),
        arms: randomBetween(6, 12),
      },
      uniqueExercises: randomBetween(15, 25),
      prsAchieved: Math.random() > 0.7 ? randomBetween(1, 3) : 0,
      avgWorkoutDuration:
        completedWorkouts.length > 0
          ? Math.round(
              completedWorkouts.reduce(
                (sum, w) =>
                  sum +
                  (w.completedAt ? (w.completedAt.getTime() - w.startedAt.getTime()) / 60000 : 0),
                0,
              ) / completedWorkouts.length,
            )
          : null,
      avgRpe: randomFloatBetween(6.5, 8.5, 1),
      avgSetsPerWorkout: completedWorkouts.length > 0 ? totalSets / completedWorkouts.length : null,
      completionRate:
        weekWorkouts.length > 0 ? completedWorkouts.length / weekWorkouts.length : null,
    });

    currentDate = addDays(currentDate, 7);
  }

  return summaries;
}

// ============================================================================
// Sample Data Arrays
// ============================================================================

const workoutNotes = [
  "Feeling strong today!",
  "Increased weight on main lifts",
  "Good pump, great session",
  "Slightly fatigued but pushed through",
  "New PR on bench!",
  "Quick session, hit all the main movements",
  "Focused on mind-muscle connection",
  "Superset day - intense!",
];

const checkInNotes = [
  "Slept great, ready to crush it",
  "Stressful day at work",
  "Feeling well rested",
  "Need more sleep tonight",
  "Great energy after morning coffee",
  "Legs still sore from Tuesday",
];

// ============================================================================
// Main Seeding Functions
// ============================================================================

export type SeedData = {
  users: GeneratedUser[];
  accounts: GeneratedAccount[];
  exercises: GeneratedExercise[];
  templateFolders: GeneratedTemplateFolder[];
  workoutTemplates: GeneratedWorkoutTemplate[];
  workoutTemplateExercises: GeneratedWorkoutTemplateExercise[];
  workouts: GeneratedWorkout[];
  workoutExercises: GeneratedWorkoutExercise[];
  exerciseSets: GeneratedExerciseSet[];
  bodyMeasurements: GeneratedBodyMeasurement[];
  personalRecords: GeneratedPersonalRecord[];
  progressPhotos: GeneratedProgressPhoto[];
  dailyCheckIns: GeneratedDailyCheckIn[];
  muscleRecoveries: GeneratedMuscleRecovery[];
  trainingSummaries: GeneratedTrainingSummary[];
};

/**
 * Generate all seed data
 */
export function generateSeedData(): SeedData {
  log.header("Generating seed data...");

  // Generate users
  log.info("Generating users...");
  const users = generateUsers();
  const accounts = generateAccounts();
  log.success(`Generated ${users.length} users`);

  // Generate exercises
  log.info("Generating exercises...");
  const exercises = generateExercises();
  log.success(`Generated ${exercises.length} default exercises`);

  // Create exercise records with IDs for reference
  const exerciseRecords: ExerciseRecord[] = exercises.map((ex, index) => ({
    id: index + 1, // IDs start at 1
    name: ex.name,
    category: ex.category,
    muscleGroups: ex.muscleGroups,
    equipment: ex.equipment,
    exerciseType: ex.exerciseType,
  }));

  // Initialize collections
  const allTemplateFolders: GeneratedTemplateFolder[] = [];
  const allWorkoutTemplates: GeneratedWorkoutTemplate[] = [];
  const allWorkoutTemplateExercises: GeneratedWorkoutTemplateExercise[] = [];
  const allWorkouts: GeneratedWorkout[] = [];
  const allWorkoutExercises: GeneratedWorkoutExercise[] = [];
  const allExerciseSets: GeneratedExerciseSet[] = [];
  const allBodyMeasurements: GeneratedBodyMeasurement[] = [];
  const allPersonalRecords: GeneratedPersonalRecord[] = [];
  const allProgressPhotos: GeneratedProgressPhoto[] = [];
  const allDailyCheckIns: GeneratedDailyCheckIn[] = [];
  const allMuscleRecoveries: GeneratedMuscleRecovery[] = [];
  const allTrainingSummaries: GeneratedTrainingSummary[] = [];

  // Generate data for each user
  for (const profile of userProfiles) {
    log.info(`Generating data for ${profile.email}...`);

    const startDate = addDays(new Date(), -profile.dataMonths * 30);

    // Templates
    const { folders, templates, templateExercises } = generateWorkoutTemplates(
      profile,
      exerciseRecords,
    );
    allTemplateFolders.push(...folders);
    allWorkoutTemplates.push(...templates);
    allWorkoutTemplateExercises.push(...templateExercises);
    log.success(`  Created ${templates.length} templates`);

    // Workouts
    const { workouts, workoutExercises, exerciseSets } = generateWorkouts(
      profile,
      exerciseRecords,
      startDate,
    );
    allWorkouts.push(...workouts);
    allWorkoutExercises.push(...workoutExercises);
    allExerciseSets.push(...exerciseSets);
    log.success(`  Created ${workouts.length} workouts with ${exerciseSets.length} sets`);

    // Body measurements
    const measurements = generateBodyMeasurements(profile, startDate);
    allBodyMeasurements.push(...measurements);
    log.success(`  Created ${measurements.length} body measurements`);

    // Personal records
    const records = generatePersonalRecords(profile, exerciseRecords, workouts);
    allPersonalRecords.push(...records);
    log.success(`  Created ${records.length} personal records`);

    // Progress photos
    const photos = generateProgressPhotos(profile, startDate);
    allProgressPhotos.push(...photos);
    log.success(`  Created ${photos.length} progress photos`);

    // Daily check-ins (only for main user and advanced user)
    if (profile.email === "test@example.com" || profile.email === "advanced@example.com") {
      const checkIns = generateDailyCheckIns(profile, workouts);
      allDailyCheckIns.push(...checkIns);
      log.success(`  Created ${checkIns.length} daily check-ins`);
    }

    // Muscle recovery
    const recoveries = generateMuscleRecovery(profile, workouts);
    allMuscleRecoveries.push(...recoveries);
    log.success(`  Created ${recoveries.length} muscle recovery records`);

    // Training summaries
    const summaries = generateTrainingSummaries(profile, workouts, startDate);
    allTrainingSummaries.push(...summaries);
    log.success(`  Created ${summaries.length} training summaries`);
  }

  return {
    users,
    accounts,
    exercises,
    templateFolders: allTemplateFolders,
    workoutTemplates: allWorkoutTemplates,
    workoutTemplateExercises: allWorkoutTemplateExercises,
    workouts: allWorkouts,
    workoutExercises: allWorkoutExercises,
    exerciseSets: allExerciseSets,
    bodyMeasurements: allBodyMeasurements,
    personalRecords: allPersonalRecords,
    progressPhotos: allProgressPhotos,
    dailyCheckIns: allDailyCheckIns,
    muscleRecoveries: allMuscleRecoveries,
    trainingSummaries: allTrainingSummaries,
  };
}

/**
 * Get total record count
 */
export function getTotalRecordCount(data: SeedData): number {
  return (
    data.users.length +
    data.accounts.length +
    data.exercises.length +
    data.templateFolders.length +
    data.workoutTemplates.length +
    data.workoutTemplateExercises.length +
    data.workouts.length +
    data.workoutExercises.length +
    data.exerciseSets.length +
    data.bodyMeasurements.length +
    data.personalRecords.length +
    data.progressPhotos.length +
    data.dailyCheckIns.length +
    data.muscleRecoveries.length +
    data.trainingSummaries.length
  );
}
