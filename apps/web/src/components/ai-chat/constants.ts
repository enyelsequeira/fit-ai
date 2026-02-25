export const AI_CHAT_ENDPOINT = "/api/ai/chat";

export const TOOL_DISPLAY_NAMES: Record<string, string> = {
  search_exercises: "Searching exercises",
  get_user_preferences: "Reading your preferences",
  create_workout_template: "Creating template",
  add_template_day: "Adding workout day",
  add_exercise_to_template: "Adding exercise",
  list_user_templates: "Listing your templates",
  get_template_details: "Loading template details",
  delete_template: "Deleting template",
  get_recent_workouts: "Checking workout history",
  log_workout: "Logging workout",
  get_progress_summary: "Checking your progress",
  suggest_exercise_alternatives: "Finding alternatives",
};

export const SUGGESTED_PROMPTS = [
  "Create a 4-day push/pull/legs workout plan for me",
  "What exercises target my chest without equipment?",
  "Suggest a beginner-friendly full body routine",
  "Help me build a workout plan for weight loss",
  "Show me my current workout templates",
];
