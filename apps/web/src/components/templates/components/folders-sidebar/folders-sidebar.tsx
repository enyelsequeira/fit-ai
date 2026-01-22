import { IconFolder, IconFolderPlus, IconPencil, IconTemplate } from "@tabler/icons-react";
import { FitAiSidebar } from "@/components/ui/fit-ai-sidebar/fit-ai-sidebar";
import { useTemplateFolders, useTemplatesList } from "../../queries/use-queries";
import styles from "./folders-sidebar.module.css";
import { FitAiActionIcon } from "@/components/ui/fit-ai-button/fit-ai-action-icon.tsx";
import { FitAiToolTip } from "@/components/ui/fit-ai-tooltip/fit-ai-tool-tip.tsx";

type FoldersSidebarProps = {
  selectedFolderId: number | null;
  onSelectFolder: (folderId: number | null) => void;
  onCreateFolder: () => void;
  onEditFolder: (folder: { id: number; name: string }) => void;
};

export function FoldersSidebar({
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onEditFolder,
}: FoldersSidebarProps) {
  const { data: foldersData, isLoading: isFoldersLoading } = useTemplateFolders();
  const { data: templatesData, isLoading: isTemplatesLoading } = useTemplatesList();

  const folders = foldersData ?? [];
  const templates = templatesData ?? [];
  const isLoading = isFoldersLoading || isTemplatesLoading;

  // Calculate stats
  const totalTemplates = templates.length;
  const totalFolders = folders.length;
  const publicTemplates = templates.filter((t) => t.isPublic).length;
  const totalUsage = templates.reduce((sum, t) => sum + (t.timesUsed ?? 0), 0);

  // Count templates per folder
  const getTemplateCount = (folderId: number) => {
    return templates.filter((t) => t.folderId === folderId).length;
  };

  // Stats for footer
  const stats = [
    { label: "Templates", value: totalTemplates },
    { label: "Folders", value: totalFolders },
    { label: "Public", value: publicTemplates },
    { label: "Uses", value: totalUsage },
  ];

  // Header action button
  const headerAction = (
    <FitAiToolTip
      toolTipProps={{
        label: "Create folder",
      }}
    >
      <FitAiActionIcon onClick={onCreateFolder} variant={"secondary"} size={"sm"}>
        <IconFolderPlus size={14} />
      </FitAiActionIcon>
    </FitAiToolTip>
  );

  return (
    <FitAiSidebar
      selectedId={selectedFolderId}
      onSelect={(id) => onSelectFolder(id as number | null)}
      isLoading={isLoading}
    >
      <FitAiSidebar.Header title="Folders" action={headerAction} />

      <FitAiSidebar.Navigation>
        <FitAiSidebar.AllItems
          label="All Templates"
          subtext="View all templates"
          count={totalTemplates}
          icon={<IconTemplate size={18} />}
        />

        <FitAiSidebar.Section label="My Folders">
          {folders.length > 0 ? (
            folders.map((folder) => (
              <FitAiSidebar.Item
                key={folder.id}
                id={folder.id}
                label={folder.name}
                count={getTemplateCount(folder.id)}
                icon={<IconFolder size={16} />}
                action={
                  <FitAiActionIcon
                    variant={"ghost"}
                    size={"xs"}
                    onClick={() => onEditFolder({ id: folder.id, name: folder.name })}
                  >
                    <IconPencil size={12} />
                  </FitAiActionIcon>
                }
              />
            ))
          ) : (
            <FitAiSidebar.EmptyState
              icon={<IconFolder size={24} />}
              title="No folders yet"
              description="Create folders to organize your templates"
              action={
                <button type="button" className={styles.emptyStateButton} onClick={onCreateFolder}>
                  <IconFolderPlus size={14} />
                  Create Folder
                </button>
              }
            />
          )}
        </FitAiSidebar.Section>
      </FitAiSidebar.Navigation>

      <FitAiSidebar.Stats stats={stats} />
    </FitAiSidebar>
  );
}
