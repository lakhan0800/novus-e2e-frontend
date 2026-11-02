import { useState, type FormEvent } from "react";
import { api } from "../api/client";

interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

/** Chat panel backed by the API's /api/assistant route, which calls an LLM. */
export function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [pending, setPending] = useState(false);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    const next = [...messages, { role: "user" as const, content: input }];
    setMessages(next);
    setInput("");
    setPending(true);
    const startedAt = performance.now();
    try {
      const reply = await api.post<{ reply: string }>("/api/assistant", { messages: next });
      // AI outcome: the LLM answered. Prompt and reply text are not sent (may contain PII).
      window.pendo?.track("assistant_reply_received", {
        conversationLength: next.length + 1,
        replyLength: reply.reply.length,
        responseTimeMs: Math.round(performance.now() - startedAt),
        success: true,
      });
      setMessages([...next, { role: "assistant", content: reply.reply }]);
    } catch (requestError) {
      // Failure variant: the assistant request did not return a reply.
      window.pendo?.track("assistant_reply_received", {
        conversationLength: next.length,
        responseTimeMs: Math.round(performance.now() - startedAt),
        success: false,
      });
      throw requestError;
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
