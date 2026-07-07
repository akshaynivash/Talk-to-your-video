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
      className="inline-flex items-center gap-1 rounded-full border border-silver-600 bg-base-800
                 px-2.5 py-1 text-xs text-accent-bright transition-colors duration-150
                 hover:border-accent hover:bg-base-700"
      title={citation.text}
    >
      {formatTimestamp(citation.start)}
    </button>
  );
}
