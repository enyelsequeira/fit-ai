import type { CheckInFormData } from "../types";

export type { Mood, CheckInFormData } from "../types";
export { MOODS, BODY_PARTS } from "../types";

export type CheckInData = CheckInFormData;

export interface CheckInFormProps {
  initialData?: CheckInData | null;
  onSubmit: (data: CheckInData) => void;
  isLoading?: boolean;
}
