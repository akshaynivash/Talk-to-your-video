import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Circle, Loader2 } from "lucide-react";
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
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300"
      >
        <AlertTriangle size={16} />
        Processing failed.
      </motion.div>
    );
  }

  const currentIndex = VIDEO_STATUS_ORDER.indexOf(status);
  const progressPercent =
    currentIndex <= 0 ? 0 : (currentIndex / (VIDEO_STATUS_ORDER.length - 1)) * 100;

  return (
    <div className="rounded-xl border border-white/10 bg-base-900/40 p-5 shadow-card backdrop-blur-xl">
      <div className="relative mb-6 h-1 rounded-full bg-base-700">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-dim to-accent-bright"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <ol className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {VIDEO_STATUS_ORDER.map((stage, index) => {
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;
          return (
            <li key={stage} className="flex items-center gap-2">
              {isDone ? (
                <CheckCircle2 size={16} className="text-accent-bright" />
              ) : isActive ? (
                <Loader2 size={16} className="animate-spin text-accent-bright" />
              ) : (
                <Circle size={16} className="text-silver-600" />
              )}
              <span
                className={`text-xs transition-colors duration-150 ${
                  isActive
                    ? "font-medium text-accent-bright"
                    : isDone
                      ? "text-silver-300"
                      : "text-silver-500"
                }`}
              >
                {LABELS[stage]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
