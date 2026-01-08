import { Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RestTimerProps {
  defaultSeconds?: number;
  autoStart?: boolean;
  onComplete?: () => void;
  className?: string;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function RestTimer({
  defaultSeconds = 90,
  autoStart = false,
  onComplete,
  className,
}: RestTimerProps) {
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [hasCompleted, setHasCompleted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playNotification = useCallback(() => {
    try {
      // Create a simple beep using Web Audio API
      const audioContext = new (
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 200);
    } catch {
      // Audio not supported
    }
  }, []);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setHasCompleted(true);
          playNotification();
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remaining, onComplete, playNotification]);

  const handleToggle = () => {
    if (remaining === 0) {
      setRemaining(defaultSeconds);
      setHasCompleted(false);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setRemaining(defaultSeconds);
    setIsRunning(false);
    setHasCompleted(false);
  };

  const progress = (remaining / defaultSeconds) * 100;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex items-center justify-center">
        <svg className="size-12 -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={2 * Math.PI * 20}
            strokeDashoffset={2 * Math.PI * 20 * (1 - progress / 100)}
            className={cn(
              "transition-all duration-1000",
              hasCompleted ? "text-green-500" : "text-primary",
            )}
          />
        </svg>
        <span className="absolute text-xs font-mono tabular-nums">{formatTime(remaining)}</span>
      </div>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleToggle}
          aria-label={isRunning ? "Pause timer" : "Start timer"}
        >
          {isRunning ? <Pause className="size-3" /> : <Play className="size-3" />}
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={handleReset} aria-label="Reset timer">
          <RotateCcw className="size-3" />
        </Button>
      </div>

      <audio ref={audioRef} preload="auto">
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}

export { RestTimer };
