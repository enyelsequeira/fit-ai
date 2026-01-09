import type { AvatarProps as MantineAvatarProps } from "@mantine/core";

import { Avatar as MantineAvatar } from "@mantine/core";
import { forwardRef, useEffect, useState } from "react";

export type AvatarSize = "xs" | "sm" | "default" | "lg" | "xl";

const sizeMap: Record<AvatarSize, MantineAvatarProps["size"]> = {
  xs: "sm",
  sm: "md",
  default: "lg",
  lg: "xl",
  xl: 64,
};

interface AvatarProps extends Omit<MantineAvatarProps, "size"> {
  size?: AvatarSize;
  children?: React.ReactNode;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = "default", children, ...props }, ref) => {
    return (
      <MantineAvatar ref={ref} size={sizeMap[size]} radius="xl" {...props}>
        {children}
      </MantineAvatar>
    );
  },
);

Avatar.displayName = "Avatar";

interface AvatarImageProps {
  src?: string;
  alt?: string;
  onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void;
}

function AvatarImage({ src, alt, onLoadingStatusChange }: AvatarImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    if (!src) {
      setStatus("error");
      return;
    }

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setStatus("loaded");
      onLoadingStatusChange?.("loaded");
    };

    img.onerror = () => {
      setStatus("error");
      onLoadingStatusChange?.("error");
    };
  }, [src, onLoadingStatusChange]);

  if (status !== "loaded") {
    return null;
  }

  return <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
}

interface AvatarFallbackProps {
  children?: React.ReactNode;
}

function AvatarFallback({ children }: AvatarFallbackProps) {
  return <>{children}</>;
}

export { Avatar, AvatarImage, AvatarFallback };
