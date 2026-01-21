/**
 * Query options for template-related data fetching
 * Using oRPC TanStack Query integration with automatic key generation
 * @see https://orpc.dev/docs/integrations/tanstack-query
 */

import { orpc } from "@/utils/orpc";

/**
 * Query keys factory for settings-related queries
 * Used for cache invalidation where oRPC doesn't have direct routes
 */
export const settingsKeys = {
  all: ["settings"] as const,
  activeTemplate: () => [...settingsKeys.all, "activeTemplate"] as const,
};

/**
 * Query options for fetching all template folders
 * Uses orpc.*.queryOptions() for automatic key generation
 */
export function templateFoldersOptions() {
  return orpc.template.folder.list.queryOptions({
    input: {},
  });
}

/**
 * Query options for fetching templates with optional filtering
 */
export function templatesListOptions(params: {
  folderId?: number | null;
  includeNoFolder?: boolean;
  includePublic?: boolean;
  limit?: number;
  offset?: number;
}) {
  return orpc.template.list.queryOptions({
    input: {
      folderId: params.folderId ?? undefined,
      includeNoFolder:
        params.includeNoFolder ?? (params.folderId === undefined || params.folderId === null),
      includePublic: params.includePublic ?? false,
      limit: params.limit ?? 100,
      offset: params.offset ?? 0,
    },
  });
}

/**
 * Query options for fetching a single template by ID
 */
export function templateDetailOptions(templateId: number | null) {
  return orpc.template.getById.queryOptions({
    input: { id: templateId! },
    enabled: templateId !== null,
  });
}

/**
 * Query options for searching exercises
 */
export function exercisesSearchOptions(params: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return orpc.exercise.list.queryOptions({
    input: {
      search: params.search || undefined,
      category: undefined,
      exerciseType: undefined,
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
  });
}

/**
 * Query options for fetching the user's settings (including activeTemplateId)
 * Used to determine which template is currently active
 */
export function activeTemplateOptions() {
  return orpc.settings.get.queryOptions({
    input: undefined,
    queryKey: settingsKeys.activeTemplate(),
  });
}
