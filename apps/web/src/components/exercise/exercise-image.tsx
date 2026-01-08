import { Dumbbell } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface ExerciseImageProps {
  src: string | null | undefined;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  aspectRatio?: "square" | "video";
}

const sizeClasses = {
  sm: "size-10",
  md: "h-32 w-full",
  lg: "h-48 w-full",
  xl: "h-64 w-full",
};

const iconSizeClasses = {
  sm: "size-5",
  md: "size-8",
  lg: "size-12",
  xl: "size-16",
};

export function ExerciseImage({
  src,
  alt,
  size = "md",
  className,
  aspectRatio = "video",
}: ExerciseImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const showFallback = !src || hasError;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted flex items-center justify-center",
        sizeClasses[size],
        aspectRatio === "square" && "aspect-square",
        aspectRatio === "video" && size !== "sm" && "aspect-video",
        className,
      )}
    >
      {showFallback ? (
        <div className="flex items-center justify-center size-full bg-muted">
          <Dumbbell className={cn("text-muted-foreground/50", iconSizeClasses[size])} />
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
              <Dumbbell className={cn("text-muted-foreground/30", iconSizeClasses[size])} />
            </div>
          )}
          <img
            src={src}
            alt={alt}
            className={cn(
              "object-cover size-full transition-opacity duration-200",
              isLoading ? "opacity-0" : "opacity-100",
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
          />
        </>
      )}
    </div>
  );
}

interface ExerciseImageThumbnailProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

export function ExerciseImageThumbnail({ src, alt, className }: ExerciseImageThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  const showFallback = !src || hasError;

  return (
    <div
      className={cn(
        "relative size-12 shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center",
        className,
      )}
    >
      {showFallback ? (
        <Dumbbell className="size-5 text-muted-foreground/50" />
      ) : (
        <img
          src={src}
          alt={alt}
          className="object-cover size-full"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
