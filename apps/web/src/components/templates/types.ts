export interface TemplateExercise {
  id: number;
  templateId: number;
  templateDayId?: number | null;
  exerciseId: number;
  order: number;
  supersetGroupId: number | null;
  notes: string | null;
  targetSets: number;
  targetReps: string | null;
  targetWeight: number | null;
  restSeconds: number;
  createdAt: Date;
  updatedAt: Date;
  exercise?: {
    id: number;
    name: string;
    category: string;
    exerciseType: string;
  };
}

/**
 * Template Day - Represents a single day within a multi-day workout routine
 */
export interface TemplateDay {
  id: number;
  templateId: number;
  name: string;
  description: string | null;
  order: number;
  isRestDay: boolean;
  estimatedDurationMinutes: number | null;
  createdAt: Date;
  updatedAt: Date;
  exercises: TemplateExercise[];
}

/**
 * Template with days - Extended template interface including days
 */
export interface TemplateWithDays {
  id: number;
  userId: string;
  folderId: number | null;
  name: string;
  description: string | null;
  estimatedDurationMinutes: number | null;
  isPublic: boolean;
  timesUsed: number;
  createdAt: Date;
  updatedAt: Date;
  days?: TemplateDay[];
  exercises?: TemplateExercise[];
}
