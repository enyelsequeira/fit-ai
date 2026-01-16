/**
 * Query options for template-related data fetching
 * Following TanStack Query v5 queryOptions pattern
 * @see https://tanstack.com/query/v5/docs/framework/react/guides/query-options
 */

import { queryOptions } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

/**
 * Query keys factory for template-related queries
 * Used for cache invalidation and query identification
 */
export const templateKeys = {
  all: ["template"] as const,
  folders: () => [...templateKeys.all, "folders"] as const,
  lists: () => [...templateKeys.all, "list"] as const,
  list: (filters: { folderId?: number | null }) => [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, "detail"] as const,
  detail: (id: number) => [...templateKeys.details(), id] as const,
};

/**
 * Query keys factory for exercise-related queries
 */
export const exerciseKeys = {
  all: ["exercise"] as const,
  lists: () => [...exerciseKeys.all, "list"] as const,
  list: (filters: { search?: string; limit?: number; offset?: number }) =>
    [...exerciseKeys.lists(), filters] as const,
};

/**
 * Query options for fetching all template folders
 */
export function templateFoldersOptions() {
  return queryOptions({
    queryKey: templateKeys.folders(),
    queryFn: () => orpc.template.folder.list.call({}),
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
  return queryOptions({
    queryKey: templateKeys.list({ folderId: params.folderId }),
    queryFn: () =>
      orpc.template.list.call({
        folderId: params.folderId ?? undefined,
        includeNoFolder: params.includeNoFolder ?? (params.folderId === undefined || params.folderId === null),
        includePublic: params.includePublic ?? false,
        limit: params.limit ?? 100,
        offset: params.offset ?? 0,
      }),
  });
}

/**
 * Query options for fetching a single template by ID
 */
export function templateDetailOptions(templateId: number | null) {
  return queryOptions({
    queryKey: templateKeys.detail(templateId ?? 0),
    queryFn: () => orpc.template.getById.call({ id: templateId! }),
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
  return queryOptions({
    queryKey: exerciseKeys.list({
      search: params.search,
      limit: params.limit,
      offset: params.offset,
    }),
    queryFn: () =>
      orpc.exercise.list.call({
        search: params.search || undefined,
        category: undefined,
        exerciseType: undefined,
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      }),
  });
}
