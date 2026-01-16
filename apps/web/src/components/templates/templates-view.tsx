/**
 * TemplatesView - Main templates page with sidebar layout
 * Components use hooks directly for data fetching
 */

import { useCallback, useState } from "react";
import { Box, Text, Group, Button, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconTemplate } from "@tabler/icons-react";
import { FoldersSidebar } from "./components/folders-sidebar";
import { TemplatesList } from "./components/templates-list";
import { TemplatesHeader } from "./components/templates-header";
import { CreateTemplateModal } from "./components/create-template-modal";
import { TemplateDetailModal } from "./components/template-detail-modal";
import { FolderManagerModal } from "./components/folder-manager-modal";
import { useTemplateFolders } from "./queries/use-queries";
import styles from "./templates-view.module.css";

export function TemplatesView() {
  // Local state
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Folders query for CreateTemplateModal
  const foldersQuery = useTemplateFolders();
  const folders = foldersQuery.data ?? [];

  // Modal states
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [folderModalOpened, { open: openFolderModal, close: closeFolderModal }] =
    useDisclosure(false);
  const [detailModalOpened, { open: openDetailModal, close: closeDetailModal }] =
    useDisclosure(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [editingFolder, setEditingFolder] = useState<{ id: number; name: string } | null>(null);

  // Handlers
  const handleTemplateClick = useCallback(
    (templateId: number) => {
      setSelectedTemplateId(templateId);
      openDetailModal();
    },
    [openDetailModal],
  );

  const handleOpenFolderModal = useCallback(
    (folder?: { id: number; name: string }) => {
      setEditingFolder(folder ?? null);
      openFolderModal();
    },
    [openFolderModal],
  );

  // Get current folder name
  const currentFolderName =
    selectedFolderId === null
      ? "All Templates"
      : folders.find((f) => f.id === selectedFolderId)?.name ?? "Unknown Folder";

  return (
    <Box className={styles.pageContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Group gap="xs" align="center">
            <Tooltip label="Templates">
              <Box className={styles.logoIcon}>
                <IconTemplate size={20} />
              </Box>
            </Tooltip>
            <Text fw={600} size="lg">
              Templates
            </Text>
          </Group>
        </div>

        <div className={styles.sidebarContent}>
          <FoldersSidebar
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            onCreateFolder={() => handleOpenFolderModal()}
            onEditFolder={(folder) => handleOpenFolderModal(folder)}
          />
        </div>

        <div className={styles.sidebarFooter}>
          <Tooltip label="Create a new workout template">
            <Button
              fullWidth
              leftSection={<IconPlus size={16} />}
              onClick={openCreateModal}
              className={styles.createButton}
            >
              New Template
            </Button>
          </Tooltip>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <TemplatesHeader
          currentFolderName={currentFolderName}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateTemplate={openCreateModal}
          onCreateFolder={() => handleOpenFolderModal()}
        />

        {/* Content Area */}
        <div className={styles.contentArea}>
          <div className={styles.templatesContainer}>
            <TemplatesList
              folderId={selectedFolderId}
              searchQuery={searchQuery}
              onTemplateClick={handleTemplateClick}
              onCreateTemplate={openCreateModal}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateTemplateModal
        opened={createModalOpened}
        onClose={closeCreateModal}
        folders={folders}
        defaultFolderId={selectedFolderId}
      />

      <FolderManagerModal
        key={editingFolder?.id ?? "create"}
        opened={folderModalOpened}
        onClose={() => {
          closeFolderModal();
          setEditingFolder(null);
        }}
        folder={editingFolder}
      />

      <TemplateDetailModal
        opened={detailModalOpened}
        onClose={closeDetailModal}
        templateId={selectedTemplateId}
      />
    </Box>
  );
}
