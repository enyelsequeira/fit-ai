import type { VariantProps } from "class-variance-authority";

import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const avatarVariants = cva("relative flex shrink-0 overflow-hidden rounded-full", {
  variants: {
    size: {
      xs: "size-6",
      sm: "size-8",
      default: "size-10",
      lg: "size-12",
      xl: "size-16",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface AvatarProps extends React.ComponentProps<"span">, VariantProps<typeof avatarVariants> {}

function Avatar({ className, size, ...props }: AvatarProps) {
  return <span data-slot="avatar" className={cn(avatarVariants({ size }), className)} {...props} />;
}

interface AvatarImageProps extends React.ComponentProps<"img"> {
  onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void;
}

function AvatarImage({ className, src, alt, onLoadingStatusChange, ...props }: AvatarImageProps) {
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading");

  React.useEffect(() => {
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

  return (
    <img
      data-slot="avatar-image"
      src={src}
      alt={alt}
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted text-muted-foreground flex size-full items-center justify-center text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
