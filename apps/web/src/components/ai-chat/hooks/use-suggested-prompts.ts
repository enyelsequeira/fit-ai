import { useEffect, useState } from "react";

import { env } from "@fit-ai/env/web";

const SUGGESTED_PROMPTS_ENDPOINT = "/api/ai/suggested-prompts";

const STATIC_FALLBACK = [
  "Create a 4-day push/pull/legs workout plan for me",
  "What exercises target my chest without equipment?",
  "Suggest a beginner-friendly full body routine",
  "Help me build a workout plan for weight loss",
  "Show me my current workout templates",
];

export function useSuggestedPrompts() {
  const [prompts, setPrompts] = useState<string[]>(STATIC_FALLBACK);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrompts() {
      try {
        const res = await fetch(`${env.VITE_SERVER_URL}${SUGGESTED_PROMPTS_ENDPOINT}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = (await res.json()) as { prompts?: string[] };
        if (!cancelled && Array.isArray(data.prompts) && data.prompts.length > 0) {
          setPrompts(data.prompts);
        }
      } catch {
        // Keep static fallback on error
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchPrompts();
    return () => {
      cancelled = true;
    };
  }, []);

  return { prompts, isLoading };
}
