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
