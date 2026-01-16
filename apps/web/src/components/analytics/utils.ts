/**
 * Analytics utility functions
 */

/**
 * Formats a volume number into a human-readable string with appropriate units
 * @param volume - The volume in kg
 * @returns Formatted string (e.g., "1.5M kg", "12.3k kg", "500 kg")
 */
export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M kg`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k kg`;
  }
  return `${volume} kg`;
}
