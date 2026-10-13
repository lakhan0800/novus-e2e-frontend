import { useState, type FormEvent } from "react";
import { api } from "../api/client";

interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

interface AssistantReply {
  reply: string;
  id?: string;
  model?: string;
}

/** crypto.randomUUID() only exists in secure contexts, so fall back to a timestamp-based ID. */
function createId(prefix: string): string {
  return crypto.randomUUID?.() ?? `${prefix}_${Date.now()}`;
}

/** Chat panel backed by the API's /api/assistant route, which calls an LLM. */
export function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [conversationId] = useState(() => createId("conversation"));

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    window.pendo?.trackAgent?.("prompt", {
      agentId: "sJK9pmytiG3CySZYAjnTzou1EC8",
      conversationId,
      messageId: createId("prompt"),
      content: input,
      suggestedPrompt: false,
      fileUploaded: false,
    });
    const next = [...messages, { role: "user" as const, content: input }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const reply = await api.post<AssistantReply>("/api/assistant", { messages: next });
      setMessages([...next, { role: "assistant", content: reply.reply }]);
      window.pendo?.trackAgent?.("agent_response", {
        agentId: "sJK9pmytiG3CySZYAjnTzou1EC8",
        conversationId,
        messageId: reply.id ?? createId("agent_response"),
        content: reply.reply,
        modelUsed: reply.model,
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
