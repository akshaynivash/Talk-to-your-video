import { PlayCircle } from "lucide-react";
import type { Citation } from "../types";

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface CitationChipProps {
  citation: Citation;
  onClick?: (citation: Citation) => void;
}

export function CitationChip({ citation, onClick }: CitationChipProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(citation)}
      className="inline-flex items-center gap-1 rounded-full border border-base-600 bg-base-900/60
                 px-2.5 py-1 font-mono text-xs text-accent-bright transition-all duration-150
                 hover:border-accent-dim hover:bg-accent-dim/10 hover:shadow-glow"
      title={citation.text}
    >
      <PlayCircle size={12} />
      {formatTimestamp(citation.start)}
    </button>
  );
}
