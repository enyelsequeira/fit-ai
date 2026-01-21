/**
 * Audio and vibration utilities for the rest timer
 * Uses Web Audio API to generate tones without external audio files
 */

let audioContext: AudioContext | null = null;

/**
 * Get or create the AudioContext (lazy initialization)
 * AudioContext should only be created after user interaction
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!audioContext) {
    try {
      audioContext = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    } catch (error) {
      console.warn("Web Audio API not supported:", error);
      return null;
    }
  }

  return audioContext;
}

/**
 * Resume audio context if suspended (required after user interaction)
 */
export async function resumeAudioContext(): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
      return true;
    } catch (error) {
      console.warn("Failed to resume audio context:", error);
      return false;
    }
  }

  return ctx.state === "running";
}

/**
 * Check if audio is enabled and ready
 */
export function isAudioEnabled(): boolean {
  const ctx = getAudioContext();
  return ctx !== null && ctx.state === "running";
}

/**
 * Play a pleasant chime sound when timer ends
 * Uses Web Audio API to generate a two-tone chime
 */
export async function playTimerEndSound(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if needed
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return;
    }
  }

  const now = ctx.currentTime;

  // Create a pleasant two-tone chime (C5 and E5)
  const frequencies = [523.25, 659.25]; // C5, E5
  const duration = 0.15;
  const gap = 0.1;

  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(freq, now);

    // Envelope: quick attack, short sustain, quick release
    const startTime = now + index * (duration + gap);
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  });

  // Play a third higher note after a short pause (G5)
  setTimeout(
    () => {
      if (ctx.state !== "running") return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(783.99, ctx.currentTime); // G5

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.2);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    },
    (duration + gap) * 2 * 1000 + 100,
  );
}

/**
 * Play a short tick sound for countdown warnings
 */
export function playTickSound(): void {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== "running") return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.005);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.05);
}

/**
 * Trigger device vibration if supported
 * @param pattern - Vibration pattern in milliseconds
 */
export function vibrate(pattern: number | number[] = 200): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (!("vibrate" in navigator)) {
    return false;
  }

  try {
    return navigator.vibrate(pattern);
  } catch (error) {
    console.warn("Vibration failed:", error);
    return false;
  }
}

/**
 * Vibrate with a pattern for timer completion
 * Three short pulses
 */
export function vibrateTimerEnd(): boolean {
  return vibrate([100, 50, 100, 50, 100]);
}

/**
 * Request permission for audio playback
 * This should be called on user interaction to unlock audio
 */
export async function requestAudioPermission(): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    // Play a silent sound to unlock audio context
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.001);

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    return true;
  } catch (error) {
    console.warn("Failed to request audio permission:", error);
    return false;
  }
}

/**
 * Clean up audio context (call on unmount if needed)
 */
export function cleanupAudioContext(): void {
  if (audioContext) {
    audioContext.close().catch(() => {
      // Ignore close errors
    });
    audioContext = null;
  }
}
