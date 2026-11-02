import { useState, type FormEvent } from "react";
import { api } from "../api/client";

interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

const TASKLY_AGENT_ID = "0jZ8d4CSK_nwuO4Laiw5JmRXgqg";

type AgentEventType = "prompt" | "agent_response" | "user_reaction";

interface AgentEventMetadata {
  agentId: string;
  conversationId: string;
  messageId: string;
  content: string;
  suggestedPrompt?: boolean;
  fileUploaded?: boolean;
}

function trackAgentEvent(eventType: AgentEventType, metadata: AgentEventMetadata): void {
  if (typeof pendo === "undefined" || typeof pendo.trackAgent !== "function") return;
  pendo.trackAgent(eventType, metadata);
}

/** Chat panel backed by the API's /api/assistant route, which calls an LLM. */
export function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [conversationId] = useState(() => crypto.randomUUID());

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    const next = [...messages, { role: "user" as const, content: input }];
    setMessages(next);
    trackAgentEvent("prompt", {
      agentId: TASKLY_AGENT_ID,
      conversationId,
      messageId: crypto.randomUUID(),
      content: input,
      suggestedPrompt: false,
      fileUploaded: false,
    });
    setInput("");
    setPending(true);
    try {
      const reply = await api.post<{ reply: string }>("/api/assistant", { messages: next });
      setMessages([...next, { role: "assistant", content: reply.reply }]);
      trackAgentEvent("agent_response", {
        agentId: TASKLY_AGENT_ID,
        conversationId,
        messageId: crypto.randomUUID(),
        content: reply.reply,
      });
    } finally {
      setPending(false);
    }
  };

  if (!open) {
    return (
      <button
        id="assistant-open"
        className="assistant-fab"
        type="button"
        onClick={() => setOpen(true)}
      >
        Ask Taskly AI
      </button>
    );
  }

  return (
    <aside className="assistant-panel">
      <header>
        <h2>Taskly AI</h2>
        <button id="assistant-close" type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </header>
      <ul className="assistant-messages">
        {messages.map((message, index) => (
          <li key={index} className={`message message-${message.role}`}>
            {message.content}
          </li>
        ))}
      </ul>
      <form onSubmit={(event) => void send(event)}>
        <input
          id="assistant-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about your projects"
        />
        <button id="assistant-submit" type="submit" disabled={pending}>
          Send
        </button>
      </form>
    </aside>
  );
}
