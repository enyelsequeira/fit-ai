/**
 * FoldersSidebar - Sidebar with folders navigation and stats
 * Uses hooks directly instead of receiving props
 */

import { Tooltip } from "@mantine/core";
import {
  IconFolder,
  IconFolderPlus,
  IconPencil,
  IconTemplate,
} from "@tabler/icons-react";
import { useTemplateFolders, useTemplatesList } from "../queries/use-queries";
import styles from "./folders-sidebar.module.css";

interface FoldersSidebarProps {
  selectedFolderId: number | null;
  onSelectFolder: (folderId: number | null) => void;
  onCreateFolder: () => void;
  onEditFolder: (folder: { id: number; name: string }) => void;
}

export function FoldersSidebar({
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onEditFolder,
}: FoldersSidebarProps) {
  // Fetch data using hooks directly
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
  const getTemplateCount = (folderId: number | null) => {
    if (folderId === null) {
      return totalTemplates;
    }
    return templates.filter((t) => t.folderId === folderId).length;
  };

  if (isLoading) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h3 className={styles.headerTitle}>Folders</h3>
        </div>
        <div className={styles.navSection}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonItem}>
              <div className={`${styles.skeleton} ${styles.skeletonIcon}`} />
              <div className={`${styles.skeleton} ${styles.skeletonText}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>Folders</h3>
        <Tooltip label="Create new folder">
          <button
            type="button"
            className={styles.addFolderButton}
            onClick={onCreateFolder}
            aria-label="Create folder"
          >
            <IconFolderPlus size={14} />
          </button>
        </Tooltip>
      </div>

      {/* Navigation */}
      <div className={styles.navSection}>
        {/* All Templates */}
        <div
          className={styles.allTemplatesItem}
          data-active={selectedFolderId === null}
          onClick={() => onSelectFolder(null)}
          onKeyDown={(e) => e.key === "Enter" && onSelectFolder(null)}
          role="button"
          tabIndex={0}
        >
          <div className={styles.allTemplatesIcon}>
            <IconTemplate size={18} />
          </div>
          <div className={styles.allTemplatesContent}>
            <p className={styles.allTemplatesLabel}>All Templates</p>
            <p className={styles.allTemplatesSubtext}>View all templates</p>
          </div>
          <span className={styles.allTemplatesCount}>{totalTemplates}</span>
        </div>

        {/* Divider */}
        {folders.length > 0 && (
          <>
            <div className={styles.divider} />
            <span className={styles.sectionLabel}>My Folders</span>
          </>
        )}

        {/* Folder items */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={styles.folderItem}
            data-active={selectedFolderId === folder.id}
            onClick={() => onSelectFolder(folder.id)}
            onKeyDown={(e) => e.key === "Enter" && onSelectFolder(folder.id)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.folderIcon}>
              <IconFolder size={16} />
            </div>
            <div className={styles.folderContent}>
              <p className={styles.folderName}>{folder.name}</p>
            </div>
            <span className={styles.folderCount}>{getTemplateCount(folder.id)}</span>
            <div className={styles.folderActions}>
              <Tooltip label="Edit folder">
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditFolder({ id: folder.id, name: folder.name });
                  }}
                  aria-label="Edit folder"
                >
                  <IconPencil size={12} />
                </button>
              </Tooltip>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {folders.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <IconFolder size={24} />
            </div>
            <p className={styles.emptyStateTitle}>No folders yet</p>
            <p className={styles.emptyStateText}>Create folders to organize your templates</p>
            <button
              type="button"
              className={styles.emptyStateButton}
              onClick={onCreateFolder}
            >
              <IconFolderPlus size={14} />
              Create Folder
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalTemplates}</span>
          <span className={styles.statLabel}>Templates</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalFolders}</span>
          <span className={styles.statLabel}>Folders</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{publicTemplates}</span>
          <span className={styles.statLabel}>Public</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalUsage}</span>
          <span className={styles.statLabel}>Uses</span>
        </div>
      </div>
    </div>
  );
}
