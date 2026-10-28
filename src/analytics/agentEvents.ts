/** Pendo trackAgent events for the Taskly AI assistant (see components/AssistantPanel.tsx). */

export const TASKLY_AI_AGENT_ID = "tJdSPowAJX44TLv4eoICweCAQyc";

export type AgentEventType = "prompt" | "agent_response" | "user_reaction";

export interface AgentEventMetadata {
  conversationId: string;
  messageId: string;
  content: string;
  modelUsed?: string;
  suggestedPrompt?: boolean;
  toolsUsed?: string[];
  fileUploaded?: boolean;
}

export function trackAgentEvent(eventType: AgentEventType, metadata: AgentEventMetadata): void {
  if (typeof pendo === "undefined" || typeof pendo.trackAgent !== "function") return;
  pendo.trackAgent(eventType, { agentId: TASKLY_AI_AGENT_ID, ...metadata });
}
