import { createFileRoute } from "@tanstack/react-router";
import { AiChatView } from "@/components/ai-chat/ai-chat-view";

export const Route = createFileRoute("/dashboard/ai/")({
  component: AiChatView,
});
