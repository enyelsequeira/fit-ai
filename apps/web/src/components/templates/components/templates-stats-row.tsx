/**
 * TemplatesStatsRow - Displays template statistics in a grid
 */

import { Text, Skeleton } from "@mantine/core";
import {
  IconTemplate,
  IconFolder,
  IconTrendingUp,
  IconSparkles,
} from "@tabler/icons-react";
import styles from "../templates-view.module.css";

interface TemplatesStats {
  totalTemplates: number;
  totalFolders: number;
  publicTemplates: number;
  totalUsage: number;
  isLoading: boolean;
}

interface TemplatesStatsRowProps {
  stats: TemplatesStats;
  isLoading: boolean;
}

const STAT_CARDS = [
  { key: "templates", color: "blue", icon: IconTemplate, label: "Templates", field: "totalTemplates" },
  { key: "folders", color: "gray", icon: IconFolder, label: "Folders", field: "totalFolders" },
  { key: "usage", color: "teal", icon: IconTrendingUp, label: "Total Uses", field: "totalUsage" },
  { key: "public", color: "orange", icon: IconSparkles, label: "Public", field: "publicTemplates" },
] as const;

export function TemplatesStatsRow({ stats, isLoading }: TemplatesStatsRowProps) {
  if (isLoading) {
    return (
      <div className={styles.statsRow}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={64} radius="md" className={styles.statCard} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.statsRow}>
      {STAT_CARDS.map(({ key, color, icon: Icon, label, field }) => (
        <div key={key} className={styles.statCard}>
          <div className={styles.statIcon} data-color={color}>
            <Icon size={18} />
          </div>
          <div className={styles.statContent}>
            <Text className={styles.statValue}>{stats[field]}</Text>
            <Text className={styles.statLabel}>{label}</Text>
          </div>
        </div>
      ))}
    </div>
  );
}
