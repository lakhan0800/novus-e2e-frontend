/** Pendo trackAgent events for the Taskly AI assistant panel. */

export const TASKLY_AI_AGENT_ID = "Hs_EJEArifct24LkqTY-Xvt-w1k";

/** Model the API's /api/assistant route calls (see novus-e2e-backend src/routes/assistant.ts). */
export const TASKLY_AI_MODEL = "gpt-4o-mini";

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

export function trackTasklyAgentEvent(
  eventType: AgentEventType,
  metadata: AgentEventMetadata
): void {
  window.pendo?.trackAgent?.(eventType, { agentId: TASKLY_AI_AGENT_ID, ...metadata });
}
