import { useState, type FormEvent } from "react";
import { getStatusCode, pendo } from "../analytics/pendo";
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
    const promptLength = input.length;
    setMessages(next);
    setInput("");
    setPending(true);
    const startedAt = performance.now();
    try {
      const reply = await api.post<{ reply: string }>("/api/assistant", { messages: next });
      setMessages([...next, { role: "assistant", content: reply.reply }]);
      pendo.track("ai_assistant_response_received", {
        conversationLength: next.length,
        isNewConversation: messages.length === 0,
        promptLength,
        replyLength: reply.reply.length,
        // The API replies with "" when the completion has no content.
        emptyReply: reply.reply === "",
        responseTimeMs: Math.round(performance.now() - startedAt),
      });
    } catch (error) {
      pendo.track("ai_assistant_request_failed", {
        statusCode: getStatusCode(error),
        errorMessage: (error instanceof Error ? error.message : String(error)).slice(0, 100),
        conversationLength: next.length,
        promptLength,
        responseTimeMs: Math.round(performance.now() - startedAt),
      });
      // This block only adds tracking; re-throw so the failure propagates exactly as before.
      throw error;
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
