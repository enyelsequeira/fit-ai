import { Box, Center } from "@mantine/core";
import { IconBarbell } from "@tabler/icons-react";
import { useState } from "react";

interface ExerciseImageProps {
  src: string | null | undefined;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  aspectRatio?: "square" | "video";
}

const sizeStyles = {
  sm: { width: 40, height: 40 },
  md: { width: "100%", height: 128 },
  lg: { width: "100%", height: 192 },
  xl: { width: "100%", height: 256 },
} as const;

const iconSizes = {
  sm: 20,
  md: 32,
  lg: 48,
  xl: 64,
} as const;

export function ExerciseImage({
  src,
  alt,
  size = "md",
  aspectRatio = "video",
}: ExerciseImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const showFallback = !src || hasError;

  const aspectRatioValue =
    aspectRatio === "square" ? "1 / 1" : size !== "sm" ? "16 / 9" : undefined;

  return (
    <Box
      pos="relative"
      style={{
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        aspectRatio: aspectRatioValue,
        ...sizeStyles[size],
      }}
      bg="var(--mantine-color-default)"
    >
      {showFallback ? (
        <Center w="100%" h="100%" bg="var(--mantine-color-default)">
          <IconBarbell
            size={iconSizes[size]}
            style={{ opacity: 0.5, color: "var(--mantine-color-dimmed)" }}
          />
        </Center>
      ) : (
        <>
          {isLoading && (
            <Center
              pos="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="var(--mantine-color-default)"
              style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
            >
              <IconBarbell
                size={iconSizes[size]}
                style={{ opacity: 0.3, color: "var(--mantine-color-dimmed)" }}
              />
            </Center>
          )}
          <Box
            component="img"
            src={src}
            alt={alt}
            w="100%"
            h="100%"
            style={{
              objectFit: "cover",
              transition: "opacity 200ms",
              opacity: isLoading ? 0 : 1,
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
          />
        </>
      )}
    </Box>
  );
}

interface ExerciseImageThumbnailProps {
  src: string | null | undefined;
  alt: string;
}

export function ExerciseImageThumbnail({ src, alt }: ExerciseImageThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  const showFallback = !src || hasError;

  return (
    <Center
      pos="relative"
      w={48}
      h={48}
      style={{
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: "var(--mantine-radius-md)",
      }}
      bg="var(--mantine-color-default)"
    >
      {showFallback ? (
        <IconBarbell size={20} style={{ opacity: 0.5, color: "var(--mantine-color-dimmed)" }} />
      ) : (
        <Box
          component="img"
          src={src}
          alt={alt}
          w="100%"
          h="100%"
          style={{ objectFit: "cover" }}
          onError={() => setHasError(true)}
        />
      )}
    </Center>
  );
}
