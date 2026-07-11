import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isAsking]);

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
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <Sparkles size={20} className="text-silver-600" />
            <p className="text-sm text-silver-500">
              Ask a question about this video once processing completes.
            </p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                message.role === "user"
                  ? "self-end bg-gradient-to-br from-accent-dim to-accent text-base-950"
                  : "self-start border border-base-700 bg-base-800/90 text-silver-100"
              }`}
            >
              <p className="leading-relaxed">{message.content}</p>
              {message.citations && message.citations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {message.citations.map((citation, i) => (
                    <CitationChip key={i} citation={citation} onClick={onCitationClick} />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isAsking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex w-fit items-center gap-1 self-start rounded-xl border border-base-700
                       bg-base-800/90 px-3.5 py-2.5"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-silver-400"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          disabled={disabled}
          placeholder="Ask about this video..."
          className="flex-1 rounded-lg border border-silver-600 bg-base-800/80 px-3 py-2.5 text-sm
                     text-silver-100 placeholder-silver-500 outline-none transition-all
                     duration-150 focus:border-accent focus:shadow-glow disabled:opacity-50"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || isAsking}
          className="flex items-center gap-1.5 rounded-lg border border-accent-dim/50 bg-accent-dim/10
                     px-4 py-2.5 text-sm font-medium text-accent-bright transition-all duration-150
                     hover:bg-accent-dim/20 hover:shadow-glow disabled:opacity-50 disabled:hover:shadow-none"
        >
          <span>Ask</span>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
