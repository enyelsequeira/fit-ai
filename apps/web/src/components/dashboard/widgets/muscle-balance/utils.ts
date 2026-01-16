import type { MuscleData } from "./types";

import { CIRCUMFERENCE } from "./types";

export interface DonutSegment extends MuscleData {
  offset: number;
  index: number;
}

/** Calculate segment offsets for the donut chart */
export function calculateSegments(data: MuscleData[]): DonutSegment[] {
  let currentOffset = 0;
  return data.map((item, index) => {
    const segment: DonutSegment = {
      ...item,
      offset: currentOffset,
      index,
    };
    currentOffset += (item.percentage / 100) * CIRCUMFERENCE;
    return segment;
  });
}

/** Calculate total volume from muscle data */
export function calculateTotalVolume(data: MuscleData[]): number {
  return data.reduce((sum, d) => sum + d.volume, 0);
}

/** Format volume for display (e.g., 1500 -> "1.5k") */
export function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  return volume.toLocaleString();
}

export interface ImbalanceResult {
  hasImbalance: boolean;
  message?: string;
}

/** Detect muscle imbalance based on percentage distribution */
export function detectMuscleImbalance(data: MuscleData[], threshold = 35): ImbalanceResult {
  if (data.length < 2) {
    return { hasImbalance: false };
  }

  const maxPercentage = Math.max(...data.map((d) => d.percentage));
  const minPercentage = Math.min(...data.map((d) => d.percentage));
  const ratio = maxPercentage / Math.max(minPercentage, 1);

  if (ratio > 3) {
    const dominant = data.find((d) => d.percentage === maxPercentage);
    const neglected = data.find((d) => d.percentage === minPercentage);

    if (dominant && neglected) {
      return {
        hasImbalance: true,
        message: `${dominant.muscleGroup} is significantly overtrained compared to ${neglected.muscleGroup}. Consider balancing your routine.`,
      };
    }
  }

  if (maxPercentage > threshold) {
    const dominant = data.find((d) => d.percentage === maxPercentage);
    if (dominant) {
      return {
        hasImbalance: true,
        message: `${dominant.muscleGroup} accounts for ${maxPercentage.toFixed(0)}% of your training. Consider diversifying.`,
      };
    }
  }

  return { hasImbalance: false };
}
