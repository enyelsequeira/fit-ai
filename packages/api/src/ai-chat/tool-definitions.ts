import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";

export const searchExercisesDef = toolDefinition({
  name: "search_exercises",
  description:
    "Search the exercise database by name, category, equipment, or muscle group. Returns matching exercises with their details.",
  inputSchema: z.object({
    query: z.string().optional().describe("Search by exercise name"),
    category: z
      .string()
      .optional()
      .describe(
        "Filter by category: chest, back, shoulders, arms, legs, core, cardio, flexibility, compound, other",
      ),
    equipment: z
      .string()
      .optional()
      .describe("Filter by equipment type like barbell, dumbbell, bodyweight, cable, machine"),
    muscleGroup: z
      .string()
      .optional()
      .describe("Filter by target muscle group like chest, biceps, quadriceps"),
    limit: z.number().default(10).describe("Max results to return"),
  }),
  outputSchema: z.object({
    exercises: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        category: z.string(),
        muscleGroups: z.array(z.string()),
        equipment: z.string().nullable(),
        exerciseType: z.string(),
      }),
    ),
  }),
});

export const getUserPreferencesDef = toolDefinition({
  name: "get_user_preferences",
  description:
    "Get the current user's training preferences including fitness goals, experience level, available equipment, injuries, and preferred workout split. Always call this first when creating a personalized plan.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    preferences: z
      .object({
        primaryGoal: z.string().nullable(),
        secondaryGoal: z.string().nullable(),
        experienceLevel: z.string().nullable(),
        workoutDaysPerWeek: z.number().nullable(),
        preferredWorkoutDuration: z.number().nullable(),
        availableEquipment: z.array(z.string()).nullable(),
        trainingLocation: z.string().nullable(),
        injuries: z.string().nullable(),
        avoidMuscleGroups: z.array(z.string()).nullable(),
        preferredSplit: z.string().nullable(),
      })
      .nullable(),
  }),
});

export const createTemplateDef = toolDefinition({
  name: "create_workout_template",
  description:
    "Create a new workout template for the user. After creating, add days and exercises to it.",
  inputSchema: z.object({
    name: z.string().describe("Template name, e.g. 'Push Day' or '4-Day PPL Split'"),
    description: z.string().optional().describe("Brief description of the workout plan"),
    estimatedDurationMinutes: z.number().optional().describe("Estimated total duration in minutes"),
  }),
  outputSchema: z.object({
    id: z.number(),
    name: z.string(),
  }),
});

export const addTemplateDayDef = toolDefinition({
  name: "add_template_day",
  description: "Add a training day to a workout template. Each day represents one workout session.",
  inputSchema: z.object({
    templateId: z.number().describe("ID of the template to add the day to"),
    name: z.string().describe("Day name, e.g. 'Push Day', 'Leg Day', 'Rest Day'"),
    description: z.string().optional().describe("Description of this day's focus"),
    isRestDay: z.boolean().default(false).describe("Whether this is a rest/recovery day"),
  }),
  outputSchema: z.object({
    id: z.number(),
    name: z.string(),
    order: z.number(),
  }),
});

export const addExerciseToTemplateDef = toolDefinition({
  name: "add_exercise_to_template",
  description:
    "Add an exercise to a specific day in a workout template. Use search_exercises first to find exercise IDs.",
  inputSchema: z.object({
    templateId: z.number().describe("Template ID"),
    dayId: z.number().describe("Day ID to add the exercise to"),
    exerciseId: z.number().describe("Exercise ID from the database"),
    targetSets: z.number().default(3).describe("Number of sets"),
    targetReps: z
      .string()
      .default("8-12")
      .describe("Rep range, e.g. '3-5' for strength, '8-12' for hypertrophy"),
    targetWeight: z.number().optional().describe("Target weight in user's preferred unit"),
    restSeconds: z.number().default(90).describe("Rest between sets in seconds"),
    notes: z.string().optional().describe("Notes for this exercise, e.g. 'Focus on form'"),
  }),
  outputSchema: z.object({
    id: z.number(),
    exerciseName: z.string(),
  }),
});

export const listUserTemplatesDef = toolDefinition({
  name: "list_user_templates",
  description: "List the user's existing workout templates to see what plans they already have.",
  inputSchema: z.object({
    limit: z.number().default(10).describe("Max templates to return"),
  }),
  outputSchema: z.object({
    templates: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        description: z.string().nullable(),
        timesUsed: z.number(),
      }),
    ),
  }),
});

export const getTemplateDetailsDef = toolDefinition({
  name: "get_template_details",
  description:
    "Get full details of a workout template including all days and exercises. Use this to review or explain an existing template.",
  inputSchema: z.object({
    templateId: z.number().describe("Template ID to get details for"),
  }),
  outputSchema: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    days: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        isRestDay: z.boolean(),
        exercises: z.array(
          z.object({
            id: z.number(),
            exerciseName: z.string(),
            targetSets: z.number(),
            targetReps: z.string().nullable(),
            restSeconds: z.number(),
            notes: z.string().nullable(),
          }),
        ),
      }),
    ),
  }),
});

export const deleteTemplateDef = toolDefinition({
  name: "delete_template",
  description: "Delete a workout template. Only delete if the user explicitly asks to remove it.",
  inputSchema: z.object({
    templateId: z.number().describe("Template ID to delete"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
});

export const getWorkoutHistoryDef = toolDefinition({
  name: "get_recent_workouts",
  description:
    "Get the user's recent workout history to understand their training patterns and frequency.",
  inputSchema: z.object({
    limit: z.number().default(5).describe("Number of recent workouts to return"),
  }),
  outputSchema: z.object({
    workouts: z.array(
      z.object({
        id: z.number(),
        name: z.string().nullable(),
        startedAt: z.string(),
        completedAt: z.string().nullable(),
        exerciseCount: z.number(),
      }),
    ),
  }),
});

export const logWorkoutDef = toolDefinition({
  name: "log_workout",
  description:
    "Log a completed workout for the user. Fuzzy-matches the exercise name to find it in the database, then creates workout and set records.",
  inputSchema: z.object({
    exerciseName: z.string().describe("Name of the exercise performed (will fuzzy-match)"),
    sets: z
      .array(
        z.object({
          reps: z.number().describe("Number of reps"),
          weight: z.number().describe("Weight used"),
          weightUnit: z.enum(["kg", "lb"]).default("kg").describe("Weight unit"),
        }),
      )
      .describe("Array of sets performed"),
    notes: z.string().optional().describe("Optional notes about the workout"),
  }),
  outputSchema: z.object({
    workoutId: z.number(),
    exerciseName: z.string(),
    setsLogged: z.number(),
  }),
});

export const getProgressSummaryDef = toolDefinition({
  name: "get_progress_summary",
  description:
    "Get a summary of the user's fitness progress including active goals, recent personal records, and workout frequency/streak.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    activeGoals: z.array(
      z.object({
        title: z.string(),
        progressPercentage: z.number(),
        goalType: z.string(),
      }),
    ),
    recentPRs: z.array(
      z.object({
        exerciseName: z.string(),
        value: z.number(),
        recordType: z.string(),
        achievedAt: z.string(),
      }),
    ),
    thisWeekWorkouts: z.number(),
    lastWeekWorkouts: z.number(),
    currentStreak: z.number(),
  }),
});

export const suggestExerciseAlternativesDef = toolDefinition({
  name: "suggest_exercise_alternatives",
  description:
    "Suggest alternative exercises that target similar muscle groups. Useful when an exercise isn't available or the user wants variety.",
  inputSchema: z.object({
    exerciseId: z.number().describe("ID of the exercise to find alternatives for"),
    limit: z.number().default(5).describe("Max alternatives to return"),
  }),
  outputSchema: z.object({
    sourceExercise: z.object({
      id: z.number(),
      name: z.string(),
      muscleGroups: z.array(z.string()),
    }),
    alternatives: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        muscleGroups: z.array(z.string()),
        equipment: z.string().nullable(),
        overlapPercentage: z.number(),
      }),
    ),
  }),
});
