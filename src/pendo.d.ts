/** Event types accepted by pendo.trackAgent(). */
type PendoAgentEventType = "prompt" | "agent_response" | "user_reaction";

/** Metadata accepted by pendo.trackAgent(). */
interface PendoAgentMetadata {
  agentId: string;
  conversationId: string;
  messageId: string;
  content: string;
  modelUsed?: string;
  suggestedPrompt?: boolean;
  toolsUsed?: string[];
  fileUploaded?: boolean;
}

interface Window {
  /**
   * Pendo web SDK. Undefined when the snippet is not installed or is blocked, and trackAgent
   * may be missing until the Pendo agent script has loaded, so always call it as
   * window.pendo?.trackAgent?.(...).
   */
  pendo?: {
    trackAgent?: (eventType: PendoAgentEventType, metadata: PendoAgentMetadata) => void;
  };
}
