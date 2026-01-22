import { useMemo } from "react";

import { IconPlus, IconTemplate } from "@tabler/icons-react";

import { FitAiEntityList } from "@/components/ui/fit-ai-entity-list/fit-ai-entity-list";

import { useTemplatesList } from "../../queries/use-queries";
import { TemplateCard, TemplateCardSkeleton } from "../template-card/template-card";
import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button.tsx";

type TemplatesListProps = {
  /** Optional folder ID to filter templates */
  folderId?: number | null;
  /** Search query to filter templates client-side */
  searchQuery?: string;
  /** Callback when a template card is clicked */
  onTemplateClick: (templateId: number) => void;
  /** Callback to create a new template */
  onCreateTemplate: () => void;
};

export function TemplatesList({
  folderId,
  searchQuery,
  onTemplateClick,
  onCreateTemplate,
}: TemplatesListProps) {
  const { data: templatesData, isLoading, isError, refetch } = useTemplatesList({ folderId });

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

  const hasResults = filteredTemplates.length > 0;
  const isSearchEmpty = filteredTemplates.length === 0 && !!searchQuery?.trim();
  const isEmptyState = filteredTemplates.length === 0 && !searchQuery?.trim() && !isLoading;

  return (
    <FitAiEntityList>
      <FitAiEntityList.Loading visible={isLoading}>
        {Array.from({ length: 6 }, (_, i) => (
          <TemplateCardSkeleton key={i} animationDelay={i * 60} />
        ))}
      </FitAiEntityList.Loading>

      <FitAiEntityList.Error visible={isError} onRetry={() => refetch()} />

      <FitAiEntityList.Empty
        visible={isEmptyState}
        icon={<IconTemplate size={40} stroke={1.5} />}
        title="Start Building Your Templates"
        description="Workout templates help you stay consistent. Create a template once and use it to start sessions with just one click."
        action={
          <FitAiButton
            variant={"outline"}
            size="lg"
            leftSection={<IconPlus size={18} />}
            onClick={onCreateTemplate}
          >
            Create Your First Template
          </FitAiButton>
        }
      />

      <FitAiEntityList.SearchEmpty visible={isSearchEmpty} searchQuery={searchQuery ?? ""} />

      <FitAiEntityList.Summary visible={hasResults && !!searchQuery?.trim()}>
        Showing {filteredTemplates.length}{" "}
        {filteredTemplates.length === 1 ? "template" : "templates"}
      </FitAiEntityList.Summary>

      <FitAiEntityList.Grid>
        {filteredTemplates.map((template, index) => (
          <TemplateCard
            key={template.id}
            templateId={template.id}
            onClick={onTemplateClick}
            animationDelay={index * 50}
          />
        ))}
      </FitAiEntityList.Grid>
    </FitAiEntityList>
  );
}
