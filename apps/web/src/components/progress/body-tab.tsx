import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconArrowDown,
  IconArrowUp,
  IconCalendar,
  IconPencil,
  IconMinus,
  IconPlus,
  IconScale,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import dayjs from "dayjs";

import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Measurement {
  id: number;
  date: string;
  weight: number | null;
  bodyFatPercentage: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  leftArm: number | null;
  rightArm: number | null;
  leftThigh: number | null;
  rightThigh: number | null;
  leftCalf: number | null;
  rightCalf: number | null;
  neck: number | null;
  shoulders: number | null;
}

interface MeasurementFormData {
  date: string;
  weight: string;
  bodyFatPercentage: string;
  chest: string;
  waist: string;
  hips: string;
  leftArm: string;
  rightArm: string;
  leftThigh: string;
  rightThigh: string;
  leftCalf: string;
  rightCalf: string;
  neck: string;
  shoulders: string;
}

const initialFormData: MeasurementFormData = {
  date: dayjs().format("YYYY-MM-DD"),
  weight: "",
  bodyFatPercentage: "",
  chest: "",
  waist: "",
  hips: "",
  leftArm: "",
  rightArm: "",
  leftThigh: "",
  rightThigh: "",
  leftCalf: "",
  rightCalf: "",
  neck: "",
  shoulders: "",
};

function MeasurementForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  mode: "create" | "edit";
  initialData?: MeasurementFormData;
  onSubmit: (data: MeasurementFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState<MeasurementFormData>(initialData ?? initialFormData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof MeasurementFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => updateField("date", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            placeholder="70.5"
            value={formData.weight}
            onChange={(e) => updateField("weight", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bodyFatPercentage">Body Fat % (optional)</Label>
        <Input
          id="bodyFatPercentage"
          type="number"
          step="0.1"
          placeholder="15.0"
          value={formData.bodyFatPercentage}
          onChange={(e) => updateField("bodyFatPercentage", e.target.value)}
        />
      </div>

      <div className="border-t pt-4">
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          Measurements (cm) - Optional
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="chest">Chest</Label>
            <Input
              id="chest"
              type="number"
              step="0.1"
              placeholder="100"
              value={formData.chest}
              onChange={(e) => updateField("chest", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waist">Waist</Label>
            <Input
              id="waist"
              type="number"
              step="0.1"
              placeholder="80"
              value={formData.waist}
              onChange={(e) => updateField("waist", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hips">Hips</Label>
            <Input
              id="hips"
              type="number"
              step="0.1"
              placeholder="95"
              value={formData.hips}
              onChange={(e) => updateField("hips", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leftArm">Left Arm</Label>
            <Input
              id="leftArm"
              type="number"
              step="0.1"
              placeholder="35"
              value={formData.leftArm}
              onChange={(e) => updateField("leftArm", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rightArm">Right Arm</Label>
            <Input
              id="rightArm"
              type="number"
              step="0.1"
              placeholder="35"
              value={formData.rightArm}
              onChange={(e) => updateField("rightArm", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leftThigh">Left Thigh</Label>
            <Input
              id="leftThigh"
              type="number"
              step="0.1"
              placeholder="55"
              value={formData.leftThigh}
              onChange={(e) => updateField("leftThigh", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rightThigh">Right Thigh</Label>
            <Input
              id="rightThigh"
              type="number"
              step="0.1"
              placeholder="55"
              value={formData.rightThigh}
              onChange={(e) => updateField("rightThigh", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leftCalf">Left Calf</Label>
            <Input
              id="leftCalf"
              type="number"
              step="0.1"
              placeholder="38"
              value={formData.leftCalf}
              onChange={(e) => updateField("leftCalf", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rightCalf">Right Calf</Label>
            <Input
              id="rightCalf"
              type="number"
              step="0.1"
              placeholder="38"
              value={formData.rightCalf}
              onChange={(e) => updateField("rightCalf", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="neck">Neck</Label>
            <Input
              id="neck"
              type="number"
              step="0.1"
              placeholder="40"
              value={formData.neck}
              onChange={(e) => updateField("neck", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shoulders">Shoulders</Label>
            <Input
              id="shoulders"
              type="number"
              step="0.1"
              placeholder="115"
              value={formData.shoulders}
              onChange={(e) => updateField("shoulders", e.target.value)}
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Log Measurement" : "Update"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function MeasurementCard({
  label,
  value,
  lastChange,
  startChange,
  unit = "cm",
}: {
  label: string;
  value: number | null;
  lastChange: number | null;
  startChange: number | null;
  unit?: string;
}) {
  if (value === null) return null;

  const ChangeIcon = lastChange === null ? IconMinus : lastChange > 0 ? IconArrowUp : IconArrowDown;

  return (
    <div className="flex flex-col gap-1 rounded-none border border-border/50 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-bold">
        {value.toFixed(1)}
        {unit}
      </span>
      <div className="flex gap-2 text-xs">
        {lastChange !== null && (
          <span
            className={cn(
              "flex items-center gap-0.5",
              lastChange > 0
                ? "text-emerald-500"
                : lastChange < 0
                  ? "text-red-500"
                  : "text-muted-foreground",
            )}
          >
            <ChangeIcon className="size-3" />
            {Math.abs(lastChange).toFixed(1)} last
          </span>
        )}
        {startChange !== null && (
          <span className="text-muted-foreground">
            {startChange >= 0 ? "+" : ""}
            {startChange.toFixed(1)} total
          </span>
        )}
      </div>
    </div>
  );
}

export function BodyTab() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);

  const latestMeasurement = useQuery(orpc.bodyMeasurement.getLatest.queryOptions());
  const measurementTrends = useQuery(
    orpc.bodyMeasurement.getTrends.queryOptions({ input: { period: "quarter" } }),
  );
  const measurementHistory = useQuery(
    orpc.bodyMeasurement.list.queryOptions({ input: { limit: 50 } }),
  );

  const createMutation = useMutation(
    orpc.bodyMeasurement.create.mutationOptions({
      onSuccess: () => {
        toast.success("Measurement logged successfully");
        setIsCreateOpen(false);
        queryClient.invalidateQueries({ queryKey: ["bodyMeasurement"] });
      },
      onError: (error) => {
        toast.error(`Failed to log measurement: ${error.message}`);
      },
    }),
  );

  const updateMutation = useMutation(
    orpc.bodyMeasurement.update.mutationOptions({
      onSuccess: () => {
        toast.success("Measurement updated successfully");
        setEditingMeasurement(null);
        queryClient.invalidateQueries({ queryKey: ["bodyMeasurement"] });
      },
      onError: (error) => {
        toast.error(`Failed to update measurement: ${error.message}`);
      },
    }),
  );

  const deleteMutation = useMutation(
    orpc.bodyMeasurement.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Measurement deleted");
        queryClient.invalidateQueries({ queryKey: ["bodyMeasurement"] });
      },
      onError: (error) => {
        toast.error(`Failed to delete measurement: ${error.message}`);
      },
    }),
  );

  const handleCreate = (data: MeasurementFormData) => {
    createMutation.mutate({
      measuredAt: data.date,
      weight: data.weight ? Number.parseFloat(data.weight) : undefined,
      bodyFatPercentage: data.bodyFatPercentage
        ? Number.parseFloat(data.bodyFatPercentage)
        : undefined,
      chest: data.chest ? Number.parseFloat(data.chest) : undefined,
      waist: data.waist ? Number.parseFloat(data.waist) : undefined,
      hips: data.hips ? Number.parseFloat(data.hips) : undefined,
      leftArm: data.leftArm ? Number.parseFloat(data.leftArm) : undefined,
      rightArm: data.rightArm ? Number.parseFloat(data.rightArm) : undefined,
      leftThigh: data.leftThigh ? Number.parseFloat(data.leftThigh) : undefined,
      rightThigh: data.rightThigh ? Number.parseFloat(data.rightThigh) : undefined,
      leftCalf: data.leftCalf ? Number.parseFloat(data.leftCalf) : undefined,
      rightCalf: data.rightCalf ? Number.parseFloat(data.rightCalf) : undefined,
      neck: data.neck ? Number.parseFloat(data.neck) : undefined,
      shoulders: data.shoulders ? Number.parseFloat(data.shoulders) : undefined,
    });
  };

  const handleUpdate = (data: MeasurementFormData) => {
    if (!editingMeasurement) return;
    updateMutation.mutate({
      id: editingMeasurement.id,
      measuredAt: data.date,
      weight: data.weight ? Number.parseFloat(data.weight) : undefined,
      bodyFatPercentage: data.bodyFatPercentage
        ? Number.parseFloat(data.bodyFatPercentage)
        : undefined,
      chest: data.chest ? Number.parseFloat(data.chest) : undefined,
      waist: data.waist ? Number.parseFloat(data.waist) : undefined,
      hips: data.hips ? Number.parseFloat(data.hips) : undefined,
      leftArm: data.leftArm ? Number.parseFloat(data.leftArm) : undefined,
      rightArm: data.rightArm ? Number.parseFloat(data.rightArm) : undefined,
      leftThigh: data.leftThigh ? Number.parseFloat(data.leftThigh) : undefined,
      rightThigh: data.rightThigh ? Number.parseFloat(data.rightThigh) : undefined,
      leftCalf: data.leftCalf ? Number.parseFloat(data.leftCalf) : undefined,
      rightCalf: data.rightCalf ? Number.parseFloat(data.rightCalf) : undefined,
      neck: data.neck ? Number.parseFloat(data.neck) : undefined,
      shoulders: data.shoulders ? Number.parseFloat(data.shoulders) : undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this measurement?")) {
      deleteMutation.mutate({ id });
    }
  };

  const isLoading =
    latestMeasurement.isLoading || measurementTrends.isLoading || measurementHistory.isLoading;

  if (isLoading) {
    return <BodyTabSkeleton />;
  }

  const latest = latestMeasurement.data;
  const trends = measurementTrends.data;
  const history = measurementHistory.data ?? [];

  const currentWeight = latest?.weight;
  const startWeight = trends?.startWeight;
  const weightChange30Days = trends?.weightChange30Days ?? null;
  const goalWeight = trends?.goalWeight;

  const weightData =
    trends?.weights?.map((w) => ({
      date: new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      weight: w.weight,
    })) ?? [];

  const getMeasurementChanges = (field: keyof Measurement) => {
    const current = latest?.[field];
    if (typeof current !== "number") return { last: null, start: null };

    const sorted = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const previous = sorted[1]?.[field];
    const oldest = sorted[sorted.length - 1]?.[field];

    return {
      last: typeof previous === "number" ? current - previous : null,
      start: typeof oldest === "number" ? current - oldest : null,
    };
  };

  return (
    <div className="space-y-6">
      {/* Weight Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <IconScale className="size-4" />
              Weight
            </CardTitle>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <IconPlus className="size-4" />
                  Log Measurement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Log Measurement</DialogTitle>
                  <DialogDescription>
                    Record your body measurements to track progress over time.
                  </DialogDescription>
                </DialogHeader>
                <MeasurementForm
                  mode="create"
                  onSubmit={handleCreate}
                  onCancel={() => setIsCreateOpen(false)}
                  isSubmitting={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-wrap items-baseline gap-4">
            <span className="text-4xl font-bold">
              {currentWeight ? `${currentWeight.toFixed(1)}kg` : "—"}
            </span>
            {weightChange30Days !== null && (
              <Badge variant={weightChange30Days < 0 ? "success" : "secondary"}>
                {weightChange30Days >= 0 ? "+" : ""}
                {weightChange30Days.toFixed(1)}kg in last 30 days
              </Badge>
            )}
          </div>

          {weightData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis
                    domain={["dataMin - 2", "dataMax + 2"]}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}kg`, "Weight"]}
                  />
                  {goalWeight && (
                    <ReferenceLine
                      y={goalWeight}
                      stroke="hsl(var(--success))"
                      strokeDasharray="5 5"
                      label={{
                        value: `Goal: ${goalWeight}kg`,
                        position: "right",
                        fontSize: 10,
                        fill: "hsl(var(--success))",
                      }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={IconScale}
              title="No weight data"
              description="Track your first measurement to see progress"
            />
          )}
        </CardContent>
      </Card>

      {/* Measurements Section */}
      <Card>
        <CardHeader>
          <CardTitle>Body Measurements</CardTitle>
        </CardHeader>
        <CardContent>
          {latest ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <MeasurementCard
                label="Chest"
                value={latest.chest}
                {...getMeasurementChanges("chest")}
              />
              <MeasurementCard
                label="Waist"
                value={latest.waist}
                {...getMeasurementChanges("waist")}
              />
              <MeasurementCard
                label="Hips"
                value={latest.hips}
                {...getMeasurementChanges("hips")}
              />
              <MeasurementCard
                label="Left Arm"
                value={latest.leftArm}
                {...getMeasurementChanges("leftArm")}
              />
              <MeasurementCard
                label="Right Arm"
                value={latest.rightArm}
                {...getMeasurementChanges("rightArm")}
              />
              <MeasurementCard
                label="Left Thigh"
                value={latest.leftThigh}
                {...getMeasurementChanges("leftThigh")}
              />
              <MeasurementCard
                label="Right Thigh"
                value={latest.rightThigh}
                {...getMeasurementChanges("rightThigh")}
              />
              <MeasurementCard
                label="Left Calf"
                value={latest.leftCalf}
                {...getMeasurementChanges("leftCalf")}
              />
              <MeasurementCard
                label="Right Calf"
                value={latest.rightCalf}
                {...getMeasurementChanges("rightCalf")}
              />
              <MeasurementCard
                label="Neck"
                value={latest.neck}
                {...getMeasurementChanges("neck")}
              />
              <MeasurementCard
                label="Shoulders"
                value={latest.shoulders}
                {...getMeasurementChanges("shoulders")}
              />
            </div>
          ) : (
            <EmptyState
              icon={IconScale}
              title="No measurements"
              description="Log your first measurement to track body changes"
            />
          )}
        </CardContent>
      </Card>

      {/* Measurement History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCalendar className="size-4" />
            Measurement History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between border-b border-border/50 py-3 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {dayjs(m.date).format("MMM D, YYYY")}
                    </span>
                    {m.weight && <Badge variant="outline">{m.weight.toFixed(1)}kg</Badge>}
                    {m.bodyFatPercentage && (
                      <Badge variant="outline">{m.bodyFatPercentage.toFixed(1)}% BF</Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        setEditingMeasurement({
                          ...m,
                          bodyFatPercentage: m.bodyFatPercentage ?? null,
                          chest: m.chest ?? null,
                          waist: m.waist ?? null,
                          hips: m.hips ?? null,
                          leftArm: m.leftArm ?? null,
                          rightArm: m.rightArm ?? null,
                          leftThigh: m.leftThigh ?? null,
                          rightThigh: m.rightThigh ?? null,
                          leftCalf: m.leftCalf ?? null,
                          rightCalf: m.rightCalf ?? null,
                          neck: m.neck ?? null,
                          shoulders: m.shoulders ?? null,
                        })
                      }
                    >
                      <IconPencil className="size-3" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(m.id)}>
                      <IconTrash className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={IconCalendar}
              title="No history"
              description="Your measurement history will appear here"
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editingMeasurement !== null}
        onOpenChange={(open) => !open && setEditingMeasurement(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Measurement</DialogTitle>
            <DialogDescription>Update your body measurement record.</DialogDescription>
          </DialogHeader>
          {editingMeasurement && (
            <MeasurementForm
              mode="edit"
              initialData={{
                date: dayjs(editingMeasurement.date).format("YYYY-MM-DD"),
                weight: editingMeasurement.weight?.toString() ?? "",
                bodyFatPercentage: editingMeasurement.bodyFatPercentage?.toString() ?? "",
                chest: editingMeasurement.chest?.toString() ?? "",
                waist: editingMeasurement.waist?.toString() ?? "",
                hips: editingMeasurement.hips?.toString() ?? "",
                leftArm: editingMeasurement.leftArm?.toString() ?? "",
                rightArm: editingMeasurement.rightArm?.toString() ?? "",
                leftThigh: editingMeasurement.leftThigh?.toString() ?? "",
                rightThigh: editingMeasurement.rightThigh?.toString() ?? "",
                leftCalf: editingMeasurement.leftCalf?.toString() ?? "",
                rightCalf: editingMeasurement.rightCalf?.toString() ?? "",
                neck: editingMeasurement.neck?.toString() ?? "",
                shoulders: editingMeasurement.shoulders?.toString() ?? "",
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingMeasurement(null)}
              isSubmitting={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BodyTabSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-6 h-12 w-32" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
