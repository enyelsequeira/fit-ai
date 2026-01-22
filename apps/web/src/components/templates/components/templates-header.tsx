import { IconFolder, IconFolderPlus, IconPlus } from "@tabler/icons-react";

import { FitAiPageHeader } from "@/components/ui/fit-ai-page-header/fit-ai-page-header";

import { useTemplateFolders, useTemplatesList } from "../queries/use-queries";
import { TemplatesStatsRow } from "./templates-stats-row";

type Folder = {
  id: number;
  name: string;
};

type TemplatesHeaderProps = {
  currentFolderName: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateTemplate: () => void;
  onCreateFolder: () => void;
  /** Folders for mobile filter (hidden on desktop) */
  folders?: Folder[];
  /** Currently selected folder ID (null = all templates) */
  selectedFolderId?: number | null;
  /** Callback when folder selection changes */
  onFolderChange?: (folderId: number | null) => void;
};

export function TemplatesHeader({
  currentFolderName,
  searchQuery,
  onSearchChange,
  onCreateTemplate,
  onCreateFolder,
  folders = [],
  selectedFolderId,
  onFolderChange,
}: TemplatesHeaderProps) {
  const { data: templatesData, isLoading: isTemplatesLoading } = useTemplatesList();
  const { data: foldersData, isLoading: isFoldersLoading } = useTemplateFolders();

  const isLoading = isTemplatesLoading || isFoldersLoading;

  const stats = {
    totalTemplates: templatesData?.length ?? 0,
    totalFolders: foldersData?.length ?? 0,
    publicTemplates: templatesData?.filter((t) => t.isPublic).length ?? 0,
    totalUsage: templatesData?.reduce((sum, t) => sum + (t.timesUsed ?? 0), 0) ?? 0,
    isLoading,
  };

  // Build folder options for mobile Select
  const folderOptions = [
    { value: "all", label: "All Templates" },
    ...folders.map((f) => ({ value: String(f.id), label: f.name })),
  ];

  return (
    <FitAiPageHeader>
      <FitAiPageHeader.Title>{currentFolderName}</FitAiPageHeader.Title>
      <FitAiPageHeader.Description>
        Create and manage workout templates for quick session starts
      </FitAiPageHeader.Description>

      <FitAiPageHeader.Actions>
        <FitAiPageHeader.Action
          variant="secondary"
          icon={<IconFolderPlus size={16} />}
          onClick={onCreateFolder}
          tooltip="Create a new folder to organize templates"
        >
          New Folder
        </FitAiPageHeader.Action>
        <FitAiPageHeader.Action
          variant="primary"
          icon={<IconPlus size={16} />}
          onClick={onCreateTemplate}
          tooltip="Create a new workout template"
        >
          New Template
        </FitAiPageHeader.Action>
      </FitAiPageHeader.Actions>

      <FitAiPageHeader.Stats>
        <TemplatesStatsRow stats={stats} isLoading={isLoading} />
      </FitAiPageHeader.Stats>

      <FitAiPageHeader.SearchRow>
        {onFolderChange && (
          <FitAiPageHeader.MobileFilter
            value={selectedFolderId === null ? "all" : String(selectedFolderId)}
            onChange={(value) => {
              onFolderChange(value === "all" || value === null ? null : Number(value));
            }}
            options={folderOptions}
            placeholder="Select folder"
            icon={<IconFolder size={16} />}
          />
        )}
        <FitAiPageHeader.Search
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search templates..."
        />
      </FitAiPageHeader.SearchRow>
    </FitAiPageHeader>
  );
}
