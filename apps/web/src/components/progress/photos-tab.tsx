import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconCamera,
  IconChevronLeft,
  IconChevronRight,
  IconPhoto,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import dayjs from "dayjs";

import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type PoseType = "front" | "side" | "back" | "other";

interface Photo {
  id: number;
  url: string;
  date: string;
  poseType: PoseType;
  notes: string | null;
  weight: number | null;
}

const POSE_LABELS: Record<PoseType, string> = {
  front: "Front",
  side: "Side",
  back: "Back",
  other: "Other",
};

const POSE_COLORS: Record<PoseType, string> = {
  front: "bg-blue-500/10 text-blue-500",
  side: "bg-purple-500/10 text-purple-500",
  back: "bg-amber-500/10 text-amber-500",
  other: "bg-gray-500/10 text-gray-500",
};

function PhotoUploadForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  onSubmit: (data: { file: File; date: string; poseType: PoseType; notes: string }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [poseType, setPoseType] = useState<PoseType>("front");
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileChange(droppedFile);
      }
    },
    [handleFileChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a photo");
      return;
    }
    onSubmit({ file, date, poseType, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drop Zone */}
      <div
        className={cn(
          "relative flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-none border-2 border-dashed transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground",
          preview && "border-solid",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("photo-input")?.click()}
      >
        {preview ? (
          <div className="relative h-48 w-full">
            <img src={preview} alt="Preview" className="h-full w-full object-contain" />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="absolute right-2 top-2"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setPreview(null);
              }}
            >
              <IconX className="size-3" />
            </Button>
          </div>
        ) : (
          <>
            <IconUpload className="mb-2 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
            <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
          </>
        )}
        <input
          id="photo-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
              handleFileChange(selectedFile);
            }
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="photo-date">Date</Label>
          <Input
            id="photo-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Pose Type</Label>
          <div className="flex gap-2">
            {(["front", "side", "back", "other"] as PoseType[]).map((pose) => (
              <Button
                key={pose}
                type="button"
                variant={poseType === pose ? "default" : "outline"}
                size="sm"
                onClick={() => setPoseType(pose)}
              >
                {POSE_LABELS[pose]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="photo-notes">Notes (optional)</Label>
        <Input
          id="photo-notes"
          placeholder="How are you feeling? Any observations?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!file || isSubmitting}>
          {isSubmitting ? "Uploading..." : "Upload Photo"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function PhotoLightbox({
  photo,
  photos,
  onClose,
  onNavigate,
  onDelete,
}: {
  photo: Photo;
  photos: Photo[];
  onClose: () => void;
  onNavigate: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) {
        const prevPhoto = photos[currentIndex - 1];
        if (prevPhoto) onNavigate(prevPhoto.id);
      }
      if (e.key === "ArrowRight" && hasNext) {
        const nextPhoto = photos[currentIndex + 1];
        if (nextPhoto) onNavigate(nextPhoto.id);
      }
    },
    [hasPrev, hasNext, currentIndex, photos, onNavigate, onClose],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <IconX className="size-5" />
      </Button>

      {hasPrev && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
          onClick={() => {
            const prevPhoto = photos[currentIndex - 1];
            if (prevPhoto) onNavigate(prevPhoto.id);
          }}
        >
          <IconChevronLeft className="size-6" />
        </Button>
      )}

      {hasNext && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
          onClick={() => {
            const nextPhoto = photos[currentIndex + 1];
            if (nextPhoto) onNavigate(nextPhoto.id);
          }}
        >
          <IconChevronRight className="size-6" />
        </Button>
      )}

      <div className="flex max-h-[90vh] max-w-[90vw] flex-col items-center">
        <img
          src={photo.url}
          alt={`Progress photo - ${photo.poseType}`}
          className="max-h-[80vh] object-contain"
        />
        <div className="mt-4 flex items-center gap-4 text-white">
          <span className="text-sm">{dayjs(photo.date).format("MMMM D, YYYY")}</span>
          <Badge className={POSE_COLORS[photo.poseType]}>{POSE_LABELS[photo.poseType]}</Badge>
          {photo.weight && <span className="text-sm">{photo.weight}kg</span>}
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
            onClick={() => onDelete(photo.id)}
          >
            <IconTrash className="size-4" />
          </Button>
        </div>
        {photo.notes && (
          <p className="mt-2 max-w-md text-center text-sm text-white/70">{photo.notes}</p>
        )}
      </div>
    </div>
  );
}

function PhotoComparison({ photos, onClose }: { photos: [Photo, Photo]; onClose: () => void }) {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <IconX className="size-5" />
      </Button>

      <div className="relative max-h-[80vh] max-w-[90vw]">
        <div className="relative overflow-hidden">
          {/* Photo 2 (background) */}
          <img src={photos[1].url} alt="After" className="max-h-[80vh] object-contain" />

          {/* Photo 1 (clipped overlay) */}
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
            <img src={photos[0].url} alt="Before" className="max-h-[80vh] object-contain" />
          </div>

          {/* Slider */}
          <div
            className="absolute inset-y-0 cursor-ew-resize"
            style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
          >
            <div className="h-full w-1 bg-white" />
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white p-2">
              <IconChevronLeft className="absolute -left-3 size-4 text-black" />
              <IconChevronRight className="absolute -right-3 size-4 text-black" />
            </div>
          </div>

          {/* Invisible slider control */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>

        <div className="mt-4 flex justify-between text-white">
          <div className="text-center">
            <p className="text-sm font-medium">Before</p>
            <p className="text-xs text-white/70">{dayjs(photos[0].date).format("MMM D, YYYY")}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">After</p>
            <p className="text-xs text-white/70">{dayjs(photos[1].date).format("MMM D, YYYY")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PhotosTab() {
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [comparePhotos, setComparePhotos] = useState<[Photo, Photo] | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<Photo | null>(null);

  const photosQuery = useQuery(orpc.progressPhoto.getAll.queryOptions({ input: { limit: 100 } }));

  const createMutation = useMutation(
    orpc.progressPhoto.create.mutationOptions({
      onSuccess: () => {
        toast.success("Photo uploaded successfully");
        setIsUploadOpen(false);
        queryClient.invalidateQueries({ queryKey: ["progressPhoto"] });
      },
      onError: (error) => {
        toast.error(`Failed to upload photo: ${error.message}`);
      },
    }),
  );

  const deleteMutation = useMutation(
    orpc.progressPhoto.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Photo deleted");
        setSelectedPhoto(null);
        queryClient.invalidateQueries({ queryKey: ["progressPhoto"] });
      },
      onError: (error) => {
        toast.error(`Failed to delete photo: ${error.message}`);
      },
    }),
  );

  const handleUpload = async (data: {
    file: File;
    date: string;
    poseType: PoseType;
    notes: string;
  }) => {
    // Convert file to base64 for the API
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      createMutation.mutate({
        imageData: base64,
        date: data.date,
        poseType: data.poseType,
        notes: data.notes || undefined,
      });
    };
    reader.readAsDataURL(data.file);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this photo?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleCompareClick = (photo: Photo) => {
    if (!selectedForCompare) {
      setSelectedForCompare(photo);
      toast.info("Select another photo to compare");
    } else if (selectedForCompare.id === photo.id) {
      setSelectedForCompare(null);
    } else {
      // Sort by date so older photo is first
      const sorted = [selectedForCompare, photo].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ) as [Photo, Photo];
      setComparePhotos(sorted);
      setSelectedForCompare(null);
    }
  };

  if (photosQuery.isLoading) {
    return <PhotosTabSkeleton />;
  }

  const photos = (photosQuery.data ?? []) as Photo[];

  // Group photos by date
  const groupedPhotos = photos.reduce(
    (acc, photo) => {
      const dateKey = dayjs(photo.date).format("YYYY-MM-DD");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(photo);
      return acc;
    },
    {} as Record<string, Photo[]>,
  );

  const sortedDates = Object.keys(groupedPhotos).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Progress Photos</h2>
          <p className="text-sm text-muted-foreground">
            {photos.length} photos
            {selectedForCompare && " - Select another photo to compare"}
          </p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <IconCamera className="size-4" />
              Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Progress Photo</DialogTitle>
              <DialogDescription>
                Add a new progress photo to track your transformation.
              </DialogDescription>
            </DialogHeader>
            <PhotoUploadForm
              onSubmit={handleUpload}
              onCancel={() => setIsUploadOpen(false)}
              isSubmitting={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const datePhotos = groupedPhotos[dateKey] ?? [];
            return (
              <div key={dateKey}>
                <h3 className="mb-3 text-sm font-medium">
                  {dayjs(dateKey).format("MMMM D, YYYY")}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {datePhotos.map((photo) => (
                    <Card
                      key={photo.id}
                      className={cn(
                        "group cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary/50",
                        selectedForCompare?.id === photo.id && "ring-2 ring-primary",
                      )}
                    >
                      <div className="relative aspect-[3/4]">
                        <img
                          src={photo.url}
                          alt={`Progress - ${photo.poseType}`}
                          className="h-full w-full object-cover"
                          onClick={() => setSelectedPhoto(photo)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <Badge
                          className={cn(
                            "absolute left-2 top-2 text-xs",
                            POSE_COLORS[photo.poseType],
                          )}
                        >
                          {POSE_LABELS[photo.poseType]}
                        </Badge>
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="xs"
                            className="text-white hover:bg-white/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompareClick(photo);
                            }}
                          >
                            Compare
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-white hover:bg-white/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(photo.id);
                            }}
                          >
                            <IconTrash className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={IconPhoto}
              title="No progress photos"
              description="Add progress photos to visualize your journey"
              action={
                <Button size="sm" onClick={() => setIsUploadOpen(true)}>
                  <IconCamera className="size-4" />
                  Add First Photo
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          photos={photos}
          onClose={() => setSelectedPhoto(null)}
          onNavigate={(id) => {
            const photo = photos.find((p) => p.id === id);
            if (photo) setSelectedPhoto(photo);
          }}
          onDelete={handleDelete}
        />
      )}

      {/* Comparison View */}
      {comparePhotos && (
        <PhotoComparison photos={comparePhotos} onClose={() => setComparePhotos(null)} />
      )}
    </div>
  );
}

function PhotosTabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full" />
        ))}
      </div>
    </div>
  );
}
