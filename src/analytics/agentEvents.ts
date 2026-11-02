/** Pendo trackAgent events for conversational AI agents (e.g. the Taskly AI assistant panel). */

export const TASKLY_AI_AGENT_ID = "u1OKtO9f2F1MNsl9u0_X0bZ5grY";

export type AgentEventType = "prompt" | "agent_response" | "user_reaction";

export interface AgentEventMetadata {
  agentId: string;
  conversationId: string;
  messageId: string;
  content: string;
  modelUsed?: string;
  suggestedPrompt?: boolean;
  toolsUsed?: string[];
  fileUploaded?: boolean;
}

export function trackAgentEvent(eventType: AgentEventType, metadata: AgentEventMetadata): void {
  window.pendo?.trackAgent?.(eventType, metadata);
}
