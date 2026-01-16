import { TextInput, Button, Text, Tooltip } from "@mantine/core";
import { IconSearch, IconPlus, IconFolderPlus } from "@tabler/icons-react";
import { useTemplatesList, useTemplateFolders } from "../queries/use-queries";
import { TemplatesStatsRow } from "./templates-stats-row";
import styles from "../templates-view.module.css";

interface TemplatesHeaderProps {
  currentFolderName: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateTemplate: () => void;
  onCreateFolder: () => void;
}

export function TemplatesHeader({
  currentFolderName,
  searchQuery,
  onSearchChange,
  onCreateTemplate,
  onCreateFolder,
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

  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.headerTitleSection}>
          <h1 className={styles.pageTitle}>{currentFolderName}</h1>
          <Text c="dimmed" size="sm" className={styles.pageDescription}>
            Create and manage workout templates for quick session starts
          </Text>
        </div>

        <div className={styles.headerActions}>
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
        </div>
      </div>

      <TemplatesStatsRow stats={stats} isLoading={isLoading} />

      <div className={styles.searchFilterBar}>
        <TextInput
          id="template-search"
          placeholder="Search templates..."
          leftSection={<IconSearch size={18} />}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          className={styles.searchInput}
          size="md"
        />
      </div>
    </header>
  );
}
