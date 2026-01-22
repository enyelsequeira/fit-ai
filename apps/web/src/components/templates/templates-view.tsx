import { useState } from "react";
import { Box, Group, Flex, Container } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconTemplate } from "@tabler/icons-react";
import { FoldersSidebar } from "./components/folders-sidebar/folders-sidebar.tsx";
import { TemplatesList } from "./components/template-list/templates-list.tsx";
import { TemplatesHeader } from "./components/templates-header";
import { CreateTemplateModal } from "./components/create-template-modal/create-template-modal.tsx";
import { TemplateDetailModal } from "./components/template-detail/template-detail-modal.tsx";
import { FolderManagerModal } from "./components/folder-manager-modal";
import { useTemplateFolders } from "./queries/use-queries";
import styles from "./templates-view.module.css";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text.tsx";
import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button.tsx";
import { FitAiContentArea } from "@/components/ui/fit-ai-content-area/fit-ai-content-area.tsx";

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
  const handleOpenFolderModal = (folder?: { id: number; name: string }) => {
    setEditingFolder(folder ?? null);
    openFolderModal();
  };

  // Get current folder name
  const currentFolderName =
    selectedFolderId === null
      ? "All Templates"
      : (folders.find((f) => f.id === selectedFolderId)?.name ?? "Unknown Folder");

  return (
    <>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Group gap="xs" align="center">
            <Flex
              align={"center"}
              justify={"center"}
              w={36}
              h={36}
              bdrs={"md"}
              c={"white"}
              className={styles.logoIcon}
            >
              <IconTemplate size={20} />
            </Flex>
            <FitAiText variant={"subheading"}>Templates</FitAiText>
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

        <Box p={"md"} className={styles.sidebarFooter}>
          <FitAiButton
            variant={"primary"}
            fullWidth
            leftSection={<IconPlus size={16} />}
            onClick={openCreateModal}
            className={styles.createButton}
          >
            New Template
          </FitAiButton>
        </Box>
      </div>

      {/* Main Content */}
      <Container fluid flex={1}>
        <TemplatesHeader
          currentFolderName={currentFolderName}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateTemplate={openCreateModal}
          onCreateFolder={() => handleOpenFolderModal()}
          folders={folders}
          selectedFolderId={selectedFolderId}
          onFolderChange={setSelectedFolderId}
        />

        {/* Content Area */}
        <FitAiContentArea>
          <TemplatesList
            folderId={selectedFolderId}
            searchQuery={searchQuery}
            onTemplateClick={(id) => {
              setSelectedTemplateId(id);
              openDetailModal();
            }}
            onCreateTemplate={openCreateModal}
          />
        </FitAiContentArea>
      </Container>

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
    </>
  );
}
