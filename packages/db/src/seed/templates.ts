/**
 * Default workout templates for seeding the database
 * These templates are marked as public so all users can access them
 */

export type SeedTemplate = {
  name: string;
  description: string;
  estimatedDurationMinutes: number;
  exercises: Array<{
    exerciseName: string;
    order: number;
    targetSets: number;
    targetReps: string;
    restSeconds: number;
    supersetGroupId?: number;
    notes?: string;
  }>;
};

/**
 * Default workout templates
 * Exercise names must match the seeded exercise names exactly
 */
export const defaultTemplates: SeedTemplate[] = [
  {
    name: "Push Day",
    description:
      "Classic push day focusing on chest, shoulders, and triceps. Great for building upper body pressing strength.",
    estimatedDurationMinutes: 60,
    exercises: [
      {
        exerciseName: "Barbell Bench Press",
        order: 1,
        targetSets: 4,
        targetReps: "8-10",
        restSeconds: 120,
      },
      {
        exerciseName: "Incline Dumbbell Press",
        order: 2,
        targetSets: 3,
        targetReps: "10-12",
        restSeconds: 90,
      },
      {
        exerciseName: "Overhead Press",
        order: 3,
        targetSets: 4,
        targetReps: "8-10",
        restSeconds: 90,
      },
      {
        exerciseName: "Lateral Raise",
        order: 4,
        targetSets: 3,
        targetReps: "12-15",
        restSeconds: 60,
      },
      {
        exerciseName: "Tricep Pushdown",
        order: 5,
        targetSets: 3,
        targetReps: "12-15",
        restSeconds: 60,
      },
      {
        exerciseName: "Skull Crusher",
        order: 6,
        targetSets: 3,
        targetReps: "10-12",
        restSeconds: 60,
      },
    ],
  },
  {
    name: "Pull Day",
    description:
      "Classic pull day targeting back, biceps, and rear delts. Essential for a balanced physique and strong back.",
    estimatedDurationMinutes: 60,
    exercises: [
      {
        exerciseName: "Barbell Deadlift",
        order: 1,
        targetSets: 3,
        targetReps: "5-6",
        restSeconds: 180,
      },
      {
        exerciseName: "Pull-up",
        order: 2,
        targetSets: 4,
        targetReps: "6-10",
        restSeconds: 90,
      },
      {
        exerciseName: "Bent Over Barbell Row",
        order: 3,
        targetSets: 4,
        targetReps: "8-10",
        restSeconds: 90,
      },
      {
        exerciseName: "Lat Pulldown",
        order: 4,
        targetSets: 3,
        targetReps: "10-12",
        restSeconds: 60,
      },
      {
        exerciseName: "Face Pull",
        order: 5,
        targetSets: 3,
        targetReps: "15-20",
        restSeconds: 60,
      },
      {
        exerciseName: "Barbell Curl",
        order: 6,
        targetSets: 3,
        targetReps: "10-12",
        restSeconds: 60,
      },
    ],
  },
  {
    name: "Leg Day",
    description:
      "Complete lower body workout hitting quads, hamstrings, glutes, and calves for maximum leg development.",
    estimatedDurationMinutes: 70,
    exercises: [
      {
        exerciseName: "Barbell Squat",
        order: 1,
        targetSets: 4,
        targetReps: "6-8",
        restSeconds: 180,
      },
      {
        exerciseName: "Leg Press",
        order: 2,
        targetSets: 4,
        targetReps: "10-12",
        restSeconds: 120,
      },
      {
        exerciseName: "Romanian Deadlift",
        order: 3,
        targetSets: 3,
        targetReps: "10-12",
        restSeconds: 90,
      },
      {
        exerciseName: "Leg Curl",
        order: 4,
        targetSets: 3,
        targetReps: "12-15",
        restSeconds: 60,
      },
      {
        exerciseName: "Leg Extension",
        order: 5,
        targetSets: 3,
        targetReps: "12-15",
        restSeconds: 60,
      },
      {
        exerciseName: "Calf Raise",
        order: 6,
        targetSets: 4,
        targetReps: "15-20",
        restSeconds: 45,
      },
    ],
  },
  {
    name: "Upper Body",
    description:
      "Full upper body workout combining push and pull movements for balanced development. Great for 2-3 day splits.",
    estimatedDurationMinutes: 60,
    exercises: [
      {
        exerciseName: "Barbell Bench Press",
        order: 1,
        targetSets: 4,
        targetReps: "8-10",
        restSeconds: 120,
      },
      {
        exerciseName: "Bent Over Barbell Row",
        order: 2,
        targetSets: 4,
        targetReps: "8-10",
        restSeconds: 90,
      },
      {
        exerciseName: "Overhead Press",
        order: 3,
        targetSets: 3,
        targetReps: "8-10",
        restSeconds: 90,
      },
      {
        exerciseName: "Pull-up",
        order: 4,
        targetSets: 3,
        targetReps: "8-12",
        restSeconds: 90,
      },
      {
        exerciseName: "Dumbbell Curl",
        order: 5,
        targetSets: 3,
        targetReps: "10-12",
        restSeconds: 60,
      },
      {
        exerciseName: "Tricep Dip",
        order: 6,
        targetSets: 3,
        targetReps: "10-12",
        restSeconds: 60,
      },
    ],
  },
  {
    name: "Lower Body",
    description:
      "Comprehensive leg workout for building strength and muscle in your lower body. Pairs well with Upper Body template.",
    estimatedDurationMinutes: 60,
    exercises: [
      {
        exerciseName: "Barbell Squat",
        order: 1,
        targetSets: 4,
        targetReps: "6-8",
        restSeconds: 180,
      },
      {
        exerciseName: "Romanian Deadlift",
        order: 2,
        targetSets: 4,
        targetReps: "10-12",
        restSeconds: 90,
      },
      {
        exerciseName: "Walking Lunge",
        order: 3,
        targetSets: 3,
        targetReps: "10-12",
        restSeconds: 90,
      },
      {
        exerciseName: "Leg Curl",
        order: 4,
        targetSets: 3,
        targetReps: "12-15",
        restSeconds: 60,
      },
      {
        exerciseName: "Leg Extension",
        order: 5,
        targetSets: 3,
        targetReps: "12-15",
        restSeconds: 60,
      },
      {
        exerciseName: "Calf Raise",
        order: 6,
        targetSets: 4,
        targetReps: "15-20",
        restSeconds: 45,
      },
    ],
  },
  {
    name: "Full Body",
    description:
      "Efficient full body workout hitting all major muscle groups. Perfect for 3x per week training or busy schedules.",
    estimatedDurationMinutes: 75,
    exercises: [
      {
        exerciseName: "Barbell Squat",
        order: 1,
        targetSets: 4,
        targetReps: "6-8",
        restSeconds: 150,
      },
      {
        exerciseName: "Barbell Bench Press",
        order: 2,
        targetSets: 4,
        targetReps: "8-10",
        restSeconds: 120,
      },
      {
        exerciseName: "Barbell Deadlift",
        order: 3,
        targetSets: 3,
        targetReps: "5-6",
        restSeconds: 180,
      },
      {
        exerciseName: "Pull-up",
        order: 4,
        targetSets: 3,
        targetReps: "6-10",
        restSeconds: 90,
      },
      {
        exerciseName: "Overhead Press",
        order: 5,
        targetSets: 3,
        targetReps: "8-10",
        restSeconds: 90,
      },
      {
        exerciseName: "Plank",
        order: 6,
        targetSets: 3,
        targetReps: "30-60sec",
        restSeconds: 60,
      },
    ],
  },
];

/**
 * Generate SQL for seeding templates
 * Requires a user_id to own the templates (they will be marked as public)
 */
export function generateTemplatesSeedSQL(userId: string): string {
  const statements: string[] = [];

  // Exercise name to ID mapping (from seed-exercises.sql order)
  const exerciseNameToId: Record<string, number> = {
    "Barbell Bench Press": 1,
    "Incline Dumbbell Press": 2,
    "Dumbbell Fly": 3,
    "Push-up": 4,
    "Cable Crossover": 5,
    "Decline Bench Press": 6,
    "Barbell Deadlift": 7,
    "Pull-up": 8,
    "Bent Over Barbell Row": 9,
    "Lat Pulldown": 10,
    "Seated Cable Row": 11,
    "Single-Arm Dumbbell Row": 12,
    "Overhead Press": 13,
    "Lateral Raise": 14,
    "Front Raise": 15,
    "Face Pull": 16,
    "Arnold Press": 17,
    "Barbell Curl": 18,
    "Dumbbell Curl": 19,
    "Hammer Curl": 20,
    "Tricep Pushdown": 21,
    "Skull Crusher": 22,
    "Tricep Dip": 23,
    "Barbell Squat": 24,
    "Leg Press": 25,
    "Romanian Deadlift": 26,
    "Leg Curl": 27,
    "Leg Extension": 28,
    "Walking Lunge": 29,
    "Calf Raise": 30,
    Plank: 31,
    Crunch: 32,
    "Russian Twist": 33,
    "Hanging Leg Raise": 34,
    "Dead Bug": 35,
    "Ab Wheel Rollout": 36,
    Running: 37,
    Cycling: 38,
    Rowing: 39,
    "Jump Rope": 40,
    Swimming: 41,
    "Stair Climbing": 42,
    Burpee: 43,
  };

  let templateId = 1;

  for (const template of defaultTemplates) {
    // Insert template
    statements.push(`
INSERT INTO workout_template (user_id, name, description, estimated_duration_minutes, is_public, times_used)
VALUES ('${userId}', '${template.name.replace(/'/g, "''")}', '${template.description.replace(/'/g, "''")}', ${template.estimatedDurationMinutes}, 1, 0);`);

    // Insert exercises for this template
    for (const ex of template.exercises) {
      const exerciseId = exerciseNameToId[ex.exerciseName];
      if (!exerciseId) {
        console.warn(`Exercise not found: ${ex.exerciseName}`);
        continue;
      }

      statements.push(`
INSERT INTO workout_template_exercise (template_id, exercise_id, "order", target_sets, target_reps, rest_seconds)
VALUES (${templateId}, ${exerciseId}, ${ex.order}, ${ex.targetSets}, '${ex.targetReps}', ${ex.restSeconds});`);
    }

    templateId++;
  }

  return statements.join("\n");
}
