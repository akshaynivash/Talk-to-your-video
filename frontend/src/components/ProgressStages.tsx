import { VIDEO_STATUS_ORDER, type VideoStatus } from "../types";

const LABELS: Record<VideoStatus, string> = {
  queued: "Queued",
  transcribing: "Transcribing",
  extracting: "Extracting",
  embedding: "Embedding",
  writing_graph: "Writing graph",
  complete: "Complete",
  failed: "Failed",
};

interface ProgressStagesProps {
  status: VideoStatus | null;
}

export function ProgressStages({ status }: ProgressStagesProps) {
  if (!status) return null;

  if (status === "failed") {
    return (
      <div className="rounded-md border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
        Processing failed.
      </div>
    );
  }

  const currentIndex = VIDEO_STATUS_ORDER.indexOf(status);

  return (
    <ol className="flex flex-wrap items-center gap-2">
      {VIDEO_STATUS_ORDER.map((stage, index) => {
        const isActive = index === currentIndex;
        const isDone = index < currentIndex;
        return (
          <li key={stage} className="flex items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs transition-colors duration-150 ${
                isActive
                  ? "border-accent bg-base-800 text-accent-bright shadow-glow"
                  : isDone
                    ? "border-silver-600 bg-base-800 text-silver-300"
                    : "border-base-700 bg-base-900 text-silver-500"
              }`}
            >
              {LABELS[stage]}
            </span>
            {index < VIDEO_STATUS_ORDER.length - 1 && (
              <span className="text-silver-600">&rarr;</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
