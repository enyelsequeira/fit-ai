import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Group, Text } from "@mantine/core";
import { useInterval } from "@mantine/hooks";
import { IconAlertCircle, IconClock, IconRefresh } from "@tabler/icons-react";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";

type ErrorType =
  | "rate_limit"
  | "model_error"
  | "auth_error"
  | "api_key_missing"
  | "timeout"
  | "network"
  | "unknown";
type ErrorInfo = { message: string; retryable: boolean; type: ErrorType };

const ERROR_MAP: Record<ErrorType, Omit<ErrorInfo, "type">> = {
  rate_limit: { message: "Rate limit reached. Please wait a moment.", retryable: true },
  model_error: {
    message: "The AI model encountered an issue. Try rephrasing your message.",
    retryable: true,
  },
  auth_error: { message: "Session expired. Please refresh the page.", retryable: false },
  api_key_missing: { message: "AI service is not configured.", retryable: false },
  timeout: { message: "Request timed out. Try again.", retryable: true },
  network: { message: "Network error. Check your internet connection.", retryable: true },
  unknown: { message: "Something went wrong. Please try again.", retryable: true },
};

function parseError(error: unknown): ErrorInfo {
  // Try structured JSON first (from backend error responses)
  try {
    const raw = error instanceof Error ? error.message : String(error ?? "");
    const body = JSON.parse(raw);
    if (body && typeof body === "object" && "type" in body) {
      const t = (body as { type: string }).type as ErrorType;
      if (t in ERROR_MAP) return { ...ERROR_MAP[t], type: t };
    }
  } catch {
    /* not structured JSON */
  }

  // Check for common error patterns in the message
  const msg = error instanceof Error ? error.message : String(error ?? "").toLowerCase();
  const lower = msg.toLowerCase();
  if (lower.includes("failed to fetch") || lower.includes("networkerror"))
    return { ...ERROR_MAP.network, type: "network" };
  if (lower.includes("rate limit") || lower.includes("429"))
    return { ...ERROR_MAP.rate_limit, type: "rate_limit" };
  if (lower.includes("timeout") || lower.includes("timed out"))
    return { ...ERROR_MAP.timeout, type: "timeout" };
  if (lower.includes("401") || lower.includes("403") || lower.includes("unauthorized"))
    return { ...ERROR_MAP.auth_error, type: "auth_error" };
  return { ...ERROR_MAP.unknown, type: "unknown" };
}

const RATE_LIMIT_SECONDS = 30;
type ErrorBannerProps = { error: unknown; onRetry: () => void };

export function ErrorBanner({ error, onRetry }: ErrorBannerProps) {
  const info = useMemo(() => parseError(error), [error]);
  const [countdown, setCountdown] = useState(RATE_LIMIT_SECONDS);
  const isRateLimit = info.type === "rate_limit";
  const tick = useCallback(() => setCountdown((p) => (p <= 1 ? 0 : p - 1)), []);
  const interval = useInterval(tick, 1000);

  useEffect(() => {
    if (!isRateLimit) return interval.stop;
    setCountdown(RATE_LIMIT_SECONDS);
    interval.start();
    return interval.stop;
  }, [isRateLimit, interval]);

  useEffect(() => {
    if (countdown === 0 && isRateLimit) {
      interval.stop();
      onRetry();
    }
  }, [countdown, isRateLimit, interval, onRetry]);

  return (
    <Alert
      variant="light"
      color="red"
      icon={<IconAlertCircle size={18} />}
      radius="md"
      mx="md"
      mt="xs"
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Text fz="sm">
          {info.message}
          {isRateLimit && countdown > 0 && (
            <Text component="span" fz="sm" c="dimmed" ml={4}>
              <IconClock size={12} style={{ verticalAlign: "middle", marginRight: 2 }} />
              Retrying in {countdown}s
            </Text>
          )}
        </Text>
        {info.type === "auth_error" && (
          <FitAiButton
            variant="danger"
            size="xs"
            leftSection={<IconRefresh size={14} />}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </FitAiButton>
        )}
        {info.retryable && !isRateLimit && (
          <FitAiButton
            variant="danger"
            size="xs"
            leftSection={<IconRefresh size={14} />}
            onClick={onRetry}
          >
            Retry
          </FitAiButton>
        )}
      </Group>
    </Alert>
  );
}
