import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Group, Modal, ScrollArea, Stack, Text } from "@mantine/core";
import { useTemplateById } from "../../queries/use-queries.ts";
import { useCreateDay, useDeleteDay, useUpdateDay } from "../../hooks/use-mutations.ts";
import { ModalHeader } from "../modal-header.tsx";
import type { TemplateDay } from "../../types.ts";
import { DayBasedView } from "./day-tabs.tsx";
import { EmptyDaysView, EmptyTemplateState, LoadingState } from "./empty-states.tsx";

interface TemplateDetailModalProps {
  opened: boolean;
  onClose: () => void;
  templateId: number | null;
}

export function TemplateDetailModal({ opened, onClose, templateId }: TemplateDetailModalProps) {
  const [editingExerciseId, setEditingExerciseId] = useState<number | null>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [editingDayId, setEditingDayId] = useState<number | null>(null);
  const [editingDayName, setEditingDayName] = useState("");
  const [deleteConfirmDayId, setDeleteConfirmDayId] = useState<number | null>(null);

  const templateQuery = useTemplateById(templateId);
  const template = templateQuery.data;
  const isLoading = templateQuery.isLoading;

  // Day mutations
  const createDay = useCreateDay();
  const updateDay = useUpdateDay();
  const deleteDay = useDeleteDay();

  // Check if template has days (multi-day support)
  const templateWithDays = template as typeof template & { days?: TemplateDay[] };
  const hasDays = Boolean(templateWithDays?.days && templateWithDays.days.length > 0);
  const days: TemplateDay[] = templateWithDays?.days ?? [];

  // Set initial active day when days load
  useEffect(() => {
    if (days.length > 0 && !activeDay) {
      const firstDay = days[0];
      if (firstDay) {
        setActiveDay(String(firstDay.id));
      }
    }
  }, [days, activeDay]);

  // Reset active day when modal closes
  useEffect(() => {
    if (!opened) {
      setActiveDay(null);
    }
  }, [opened]);

  const excludeExerciseIds = useMemo(() => {
    const activeDayData = days.find((d) => String(d.id) === activeDay);
    return activeDayData?.exercises.map((e) => e.exerciseId) ?? [];
  }, [days, activeDay]);

  const handleCloseModal = useCallback(() => {
    setEditingExerciseId(null);
    setActiveDay(null);
    setEditingDayId(null);
    setDeleteConfirmDayId(null);
    onClose();
  }, [onClose]);

  const handleAddDay = () => {
    if (!templateId) return;
    createDay.mutate({
      templateId,
      name: `Day ${days.length + 1}`,
      isRestDay: false,
    });
  };

  const handleStartEditDay = (dayId: number, currentName: string) => {
    setEditingDayId(dayId);
    setEditingDayName(currentName);
  };

  const handleSaveDayName = () => {
    if (!templateId || !editingDayId || !editingDayName.trim()) return;
    updateDay.mutate({
      templateId,
      dayId: editingDayId,
      name: editingDayName.trim(),
    });
    setEditingDayId(null);
    setEditingDayName("");
  };

  const handleCancelEditDay = () => {
    setEditingDayId(null);
    setEditingDayName("");
  };

  const handleToggleRestDay = (dayId: number, isRestDay: boolean) => {
    if (!templateId) return;
    updateDay.mutate({
      templateId,
      dayId,
      isRestDay: !isRestDay,
    });
  };

  const handleDeleteDay = (dayId: number) => {
    if (!templateId) return;
    deleteDay.mutate(
      { templateId, dayId },
      {
        onSuccess: () => {
          setDeleteConfirmDayId(null);
          // Reset active day if deleted
          if (activeDay === String(dayId)) {
            const remaining = days.filter((d) => d.id !== dayId);
            const first = remaining[0];
            if (first) {
              setActiveDay(String(first.id));
            } else {
              setActiveDay(null);
            }
          }
        },
      },
    );
  };

  const activeDayData = days.find((d) => String(d.id) === activeDay);

  return (
    <Modal
      opened={opened}
      onClose={handleCloseModal}
      size="xl"
      padding="lg"
      radius="lg"
      withCloseButton={false}
      styles={{
        body: { padding: 0, display: "flex", flexDirection: "column", maxHeight: "85vh" },
        content: { display: "flex", flexDirection: "column", maxHeight: "85vh" },
      }}
    >
      <ScrollArea style={{ flex: 1 }} type="auto" offsetScrollbars>
        <Box p="lg">
          {isLoading ? (
            <LoadingState />
          ) : template ? (
            <Stack gap={0}>
              <ModalHeader template={template} onClose={handleCloseModal} />

              {hasDays ? (
                <DayBasedView
                  days={days}
                  activeDay={activeDay}
                  setActiveDay={setActiveDay}
                  activeDayData={activeDayData}
                  templateId={templateId ?? 0}
                  editingExerciseId={editingExerciseId}
                  setEditingExerciseId={setEditingExerciseId}
                  editingDayId={editingDayId}
                  editingDayName={editingDayName}
                  setEditingDayName={setEditingDayName}
                  deleteConfirmDayId={deleteConfirmDayId}
                  setDeleteConfirmDayId={setDeleteConfirmDayId}
                  excludeExerciseIds={excludeExerciseIds}
                  onAddDay={handleAddDay}
                  onStartEditDay={handleStartEditDay}
                  onSaveDayName={handleSaveDayName}
                  onCancelEditDay={handleCancelEditDay}
                  onToggleRestDay={handleToggleRestDay}
                  onDeleteDay={handleDeleteDay}
                  isCreatingDay={createDay.isPending}
                  isDeletingDay={deleteDay.isPending}
                />
              ) : (
                <EmptyDaysView
                  templateId={templateId ?? 0}
                  onAddDay={handleAddDay}
                  isCreatingDay={createDay.isPending}
                />
              )}
            </Stack>
          ) : (
            <EmptyTemplateState />
          )}
        </Box>
      </ScrollArea>

      {/* Delete Day Confirmation Modal */}
      <Modal
        opened={deleteConfirmDayId !== null}
        onClose={() => setDeleteConfirmDayId(null)}
        title="Delete Day"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete this day? All exercises in this day will be removed.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setDeleteConfirmDayId(null)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => deleteConfirmDayId && handleDeleteDay(deleteConfirmDayId)}
              loading={deleteDay.isPending}
            >
              Delete Day
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Modal>
  );
}
