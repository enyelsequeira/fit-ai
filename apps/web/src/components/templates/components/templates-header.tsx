import { TextInput, Button, Text, Tooltip, Select, Box, Flex, Title } from "@mantine/core";
import { IconSearch, IconPlus, IconFolderPlus, IconFolder } from "@tabler/icons-react";
import { useTemplatesList, useTemplateFolders } from "../queries/use-queries";
import { TemplatesStatsRow } from "./templates-stats-row";
import styles from "../templates-view.module.css";

interface Folder {
  id: number;
  name: string;
}

interface TemplatesHeaderProps {
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
}

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

  // Build folder options for mobile Select
  const folderOptions = [
    { value: "all", label: "All Templates" },
    ...folders.map((f) => ({ value: String(f.id), label: f.name })),
  ];

  const isLoading = isTemplatesLoading || isFoldersLoading;

  const stats = {
    totalTemplates: templatesData?.length ?? 0,
    totalFolders: foldersData?.length ?? 0,
    publicTemplates: templatesData?.filter((t) => t.isPublic).length ?? 0,
    totalUsage: templatesData?.reduce((sum, t) => sum + (t.timesUsed ?? 0), 0) ?? 0,
    isLoading,
  };

  return (
    <Box className={styles.header}>
      <Flex justify={"space-between"} align={"flex-start"} gap={"lg"} wrap={"wrap"} mb={"lg"}>
        <Flex flex={1} direction={"column"} miw={200}>
          <Title order={2} m={0} className={styles.pageTitle}>
            {currentFolderName}
          </Title>
          <Text c="dimmed" size="sm" mt={2}>
            Create and manage workout templates for quick session starts
          </Text>
        </Flex>

        <Flex gap={"sm"} className={styles.headerActions}>
          <Tooltip label="Create a new folder to organize templates">
            <Button
              variant="light"
              leftSection={<IconFolderPlus size={16} />}
              onClick={onCreateFolder}
              className={styles.secondaryButton}
            >
              New Folder
            </Button>
          </Tooltip>
          <Tooltip label="Create a new workout template">
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={onCreateTemplate}
              className={styles.primaryButton}
            >
              New Template
            </Button>
          </Tooltip>
        </Flex>
      </Flex>

      <TemplatesStatsRow stats={stats} isLoading={isLoading} />

      <Flex
        gap={"md"}
        align={{ base: "center", lg: "stretch" }}
        direction={{ base: "column", lg: "row" }}
      >
        {/* Mobile folder selector - hidden on desktop where sidebar is visible */}
        {onFolderChange && (
          <Box hiddenFrom="lg" className={styles.mobileFolderSelect}>
            <Select
              placeholder="Select folder"
              leftSection={<IconFolder size={16} />}
              data={folderOptions}
              value={selectedFolderId === null ? "all" : String(selectedFolderId)}
              onChange={(value) => {
                onFolderChange(value === "all" || value === null ? null : Number(value));
              }}
              size="md"
              comboboxProps={{ withinPortal: true }}
            />
          </Box>
        )}
        <TextInput
          id="template-search"
          placeholder="Search templates..."
          leftSection={<IconSearch size={18} />}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          size="md"
        />
      </Flex>
    </Box>
  );
}
