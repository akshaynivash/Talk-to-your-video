import { useState } from "react";
import { CitationChip } from "./CitationChip";
import type { ChatMessage, Citation } from "../types";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (question: string) => void;
  onCitationClick?: (citation: Citation) => void;
  disabled?: boolean;
  isAsking?: boolean;
}

export function ChatPanel({
  messages,
  onSend,
  onCitationClick,
  disabled,
  isAsking,
}: ChatPanelProps) {
  const [draft, setDraft] = useState("");

  function submit() {
    const question = draft.trim();
    if (!question || disabled || isAsking) return;
    onSend(question);
    setDraft("");
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-silver-500">
            Ask a question about this video once processing completes.
          </p>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              message.role === "user"
                ? "self-end bg-accent-dim text-base-950"
                : "self-start border border-base-700 bg-base-800 text-silver-100"
            }`}
          >
            <p>{message.content}</p>
            {message.citations && message.citations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {message.citations.map((citation, i) => (
                  <CitationChip key={i} citation={citation} onClick={onCitationClick} />
                ))}
              </div>
            )}
          </div>
        ))}
        {isAsking && <p className="text-sm text-silver-500">Thinking&hellip;</p>}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          disabled={disabled}
          placeholder="Ask about this video..."
          className="flex-1 rounded-md border border-silver-600 bg-base-800 px-3 py-2 text-sm
                     text-silver-100 placeholder-silver-500 outline-none transition-colors
                     duration-150 focus:border-accent disabled:opacity-50"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || isAsking}
          className="rounded-md border border-accent bg-base-800 px-4 py-2 text-sm text-accent-bright
                     transition-colors duration-150 hover:bg-base-700 disabled:opacity-50"
        >
          Ask
        </button>
      </div>
    </div>
  );
}
