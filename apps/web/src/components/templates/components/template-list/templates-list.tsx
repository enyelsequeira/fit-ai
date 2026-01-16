import { useMemo } from "react";
import { Button, Group, Tooltip } from "@mantine/core";
import { IconPlus, IconTemplate, IconSearch, IconMoodSad, IconRefresh } from "@tabler/icons-react";
import { useTemplatesList } from "../../queries/use-queries.ts";
import { TemplateCard, TemplateCardSkeleton } from "../template-card/template-card.tsx";
import styles from "./templates-list.module.css";

interface TemplatesListProps {
  /** Optional folder ID to filter templates */
  folderId?: number | null;
  /** Search query to filter templates client-side */
  searchQuery?: string;
  /** Callback when a template card is clicked */
  onTemplateClick: (templateId: number) => void;
  /** Callback to create a new template */
  onCreateTemplate: () => void;
}

function LoadingState() {
  return (
    <div className={styles.skeletonGrid}>
      {Array.from({ length: 6 }, (_, i) => (
        <TemplateCardSkeleton key={i} animationDelay={i * 60} />
      ))}
    </div>
  );
}

function SearchEmptyState({
  searchQuery,
  onCreateTemplate,
}: {
  searchQuery: string;
  onCreateTemplate: () => void;
}) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>
        <IconSearch size={32} stroke={1.5} />
      </div>
      <h3 className={styles.emptyStateTitle}>No templates found</h3>
      <p className={styles.emptyStateMessage}>
        No templates match your search for &ldquo;{searchQuery}&rdquo;. Try adjusting your search
        terms or create a new template.
      </p>
      <Group mt="lg">
        <Tooltip label="Create a new workout template" position="bottom" withArrow>
          <Button variant="light" leftSection={<IconPlus size={16} />} onClick={onCreateTemplate}>
            Create Template
          </Button>
        </Tooltip>
      </Group>
    </div>
  );
}

function NoTemplatesEmptyState({ onCreateTemplate }: { onCreateTemplate: () => void }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>
        <IconTemplate size={40} stroke={1.5} />
      </div>
      <h3 className={styles.emptyStateTitle}>Start Building Your Templates</h3>
      <p className={styles.emptyStateMessage}>
        Workout templates help you stay consistent. Create a template once and use it to start
        sessions with just one click.
      </p>

      <Tooltip label="Create your first workout template" position="bottom" withArrow>
        <Button size="lg" leftSection={<IconPlus size={18} />} onClick={onCreateTemplate} mt="xl">
          Create Your First Template
        </Button>
      </Tooltip>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.errorState}>
      <div className={styles.errorStateIcon}>
        <IconMoodSad size={32} stroke={1.5} />
      </div>
      <h3 className={styles.errorStateTitle}>Something went wrong</h3>
      <p className={styles.errorStateMessage}>
        We couldn&apos;t load your templates. This might be a temporary issue. Please try again.
      </p>
      <Tooltip label="Retry loading templates" position="bottom" withArrow>
        <Button
          variant="light"
          color="red"
          leftSection={<IconRefresh size={16} />}
          onClick={onRetry}
          mt="lg"
        >
          Try Again
        </Button>
      </Tooltip>
    </div>
  );
}

export function TemplatesList({
  folderId,
  searchQuery,
  onTemplateClick,
  onCreateTemplate,
}: TemplatesListProps) {
  // Fetch templates using hook
  const {
    data: templatesData,
    isLoading,
    isError: isTemplatesError,
    refetch: refetchTemplates,
  } = useTemplatesList({ folderId });

  // Filter templates by search query (client-side filtering)
  const filteredTemplates = useMemo(() => {
    const templates = templatesData ?? [];
    if (!searchQuery?.trim()) {
      return templates;
    }
    const query = searchQuery.toLowerCase();
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query),
    );
  }, [templatesData, searchQuery]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isTemplatesError) {
    return <ErrorState onRetry={() => refetchTemplates()} />;
  }

  if (filteredTemplates.length === 0) {
    if (searchQuery?.trim()) {
      return <SearchEmptyState searchQuery={searchQuery} onCreateTemplate={onCreateTemplate} />;
    }
    return <NoTemplatesEmptyState onCreateTemplate={onCreateTemplate} />;
  }

  return (
    <div className={styles.container}>
      {searchQuery?.trim() && (
        <div className={styles.resultsSummary}>
          <span className={styles.resultsCount}>
            Showing <span className={styles.resultsCountNumber}>{filteredTemplates.length}</span>{" "}
            {filteredTemplates.length === 1 ? "template" : "templates"}
          </span>
        </div>
      )}

      <div className={styles.templatesGrid}>
        {filteredTemplates.map((template, index) => (
          <TemplateCard
            key={template.id}
            templateId={template.id}
            onClick={onTemplateClick}
            animationDelay={index * 50}
          />
        ))}
      </div>
    </div>
  );
}
