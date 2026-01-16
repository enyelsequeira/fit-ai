export interface DayData {
  date: Date;
  workoutCount: number;
  totalVolume: number;
  workoutNames?: string[];
}

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function getIntensityLevel(workoutCount: number, totalVolume: number): 0 | 1 | 2 | 3 | 4 {
  if (workoutCount === 0) return 0;
  if (workoutCount === 1 && totalVolume < 5000) return 1;
  if (workoutCount === 1 && totalVolume >= 5000) return 2;
  if (workoutCount === 2) return 3;
  return 4;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k kg`;
  }
  return `${volume} kg`;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function generateLast30Days(): DayData[] {
  const days: DayData[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);
    days.push({
      date,
      workoutCount: 0,
      totalVolume: 0,
    });
  }

  return days;
}

export function padDaysToStartOfWeek(days: DayData[]): (DayData | null)[] {
  if (days.length === 0) return [];

  const firstDay = days[0];
  if (!firstDay) return days;

  const dayOfWeek = firstDay.date.getDay();
  const paddedDays: (DayData | null)[] = [];

  for (let i = 0; i < dayOfWeek; i++) {
    paddedDays.push(null);
  }

  for (const day of days) {
    paddedDays.push(day);
  }

  return paddedDays;
}
