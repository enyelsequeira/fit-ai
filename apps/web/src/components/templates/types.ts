/**
 * Type definitions for the Templates module
 */

export interface TemplateFolder {
  id: number;
  userId: string;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateExercise {
  id: number;
  templateId: number;
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

export interface Template {
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
}

export interface TemplateWithExercises extends Template {
  exercises: TemplateExercise[];
}

export interface TemplateStats {
  totalTemplates: number;
  totalFolders: number;
  publicTemplates: number;
  isLoading: boolean;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  folderId?: number | null;
  estimatedDurationMinutes?: number;
  isPublic?: boolean;
}

export interface CreateFolderInput {
  name: string;
}

export interface AddExerciseInput {
  exerciseId: number;
  targetSets?: number;
  targetReps?: string;
  targetWeight?: number;
  restSeconds?: number;
  notes?: string;
}
