import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { ExerciseImage } from "./exercise-image";

interface ExerciseImageGalleryProps {
  primaryImage: string | null | undefined;
  images: string[] | undefined;
  exerciseName: string;
  className?: string;
}

export function ExerciseImageGallery({
  primaryImage,
  images = [],
  exerciseName,
  className,
}: ExerciseImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Combine primary image with additional images, removing duplicates
  const allImages = primaryImage
    ? [primaryImage, ...images.filter((img) => img !== primaryImage)]
    : images;

  if (allImages.length === 0) {
    return (
      <ExerciseImage
        src={null}
        alt={exerciseName}
        size="xl"
        className={cn("rounded-md", className)}
      />
    );
  }

  const currentImage = allImages[selectedIndex] || allImages[0];
  const hasMultipleImages = allImages.length > 1;

  const goToNext = () => {
    setSelectedIndex((prev) => (prev + 1) % allImages.length);
  };

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Image */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          <ExerciseImage
            src={currentImage}
            alt={`${exerciseName} - Image ${selectedIndex + 1}`}
            size="xl"
            className="rounded-md"
          />
        </button>

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity size-8"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity size-8"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <IconChevronRight className="size-4" />
            </Button>

            {/* Image Counter */}
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {selectedIndex + 1} / {allImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selectedIndex === index
                  ? "ring-2 ring-primary ring-offset-2"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <img
                src={image}
                alt={`${exerciseName} thumbnail ${index + 1}`}
                className="object-cover size-full"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <DialogTitle className="sr-only">
            {exerciseName} - Image {selectedIndex + 1} of {allImages.length}
          </DialogTitle>
          <div className="relative flex items-center justify-center min-h-[60vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-white hover:bg-white/20 z-10"
              onClick={() => setIsLightboxOpen(false)}
            >
              <IconX className="size-5" />
            </Button>

            <img
              src={currentImage ?? undefined}
              alt={`${exerciseName} - Image ${selectedIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain"
            />

            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 size-10"
                  onClick={goToPrevious}
                >
                  <IconChevronLeft className="size-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 size-10"
                  onClick={goToNext}
                >
                  <IconChevronRight className="size-6" />
                </Button>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded">
                  {selectedIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
