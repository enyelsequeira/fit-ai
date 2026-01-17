import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@mantine/hooks";
import {
  templateFoldersOptions,
  templatesListOptions,
  templateDetailOptions,
  exercisesSearchOptions,
  activeTemplateOptions,
} from "./query-options";

/**
 * Hook for fetching template folders
 */
export function useTemplateFolders() {
  return useQuery(templateFoldersOptions());
}

/**
 * Hook for fetching templates list with optional folder filter
 */
export function useTemplatesList(params?: {
  folderId?: number | null;
  includeNoFolder?: boolean;
  includePublic?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery(
    templatesListOptions({
      folderId: params?.folderId,
      includeNoFolder: params?.includeNoFolder,
      includePublic: params?.includePublic,
      limit: params?.limit,
      offset: params?.offset,
    }),
  );
}

/**
 * Hook for fetching a single template by ID
 */
export function useTemplateById(templateId: number | null) {
  return useQuery(templateDetailOptions(templateId));
}

/**
 * Hook for searching exercises with debounce
 */
export function useExerciseSearch(params?: { search?: string; limit?: number; offset?: number }) {
  const [debouncedSearch] = useDebouncedValue(params?.search, 300);

  return useQuery(
    exercisesSearchOptions({
      search: debouncedSearch,
      limit: params?.limit,
      offset: params?.offset,
    }),
  );
}

/**
 * Hook for fetching the active template
 */
export function useActiveTemplate() {
  return useQuery(activeTemplateOptions());
}
