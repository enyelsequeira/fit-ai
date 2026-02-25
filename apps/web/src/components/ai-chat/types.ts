export type ChatMessageRole = "user" | "assistant";

export type ToolCallState =
  | "awaiting-input"
  | "input-streaming"
  | "input-complete"
  | "approval-requested"
  | "approval-responded";

export type ToolCallInfo = {
  name: string;
  state: ToolCallState;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
};
