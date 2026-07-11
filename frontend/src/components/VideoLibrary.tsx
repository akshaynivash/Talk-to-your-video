import { motion } from "framer-motion";
import { Clock, FolderOpen, Loader2, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { listVideos } from "../api/client";
import type { VideoSummary } from "../types";

interface VideoLibraryProps {
  onSelect: (videoId: string) => void;
  refreshKey?: number;
}

const STATUS_COLORS: Record<string, string> = {
  complete: "text-accent-bright border-accent-dim/40 bg-accent-dim/10",
  failed: "text-red-400 border-red-900/50 bg-red-950/20",
};

function formatDate(value: string | null): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function VideoLibrary({ onSelect, refreshKey }: VideoLibraryProps) {
  const [videos, setVideos] = useState<VideoSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listVideos()
      .then(setVideos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-silver-500">
        <Loader2 size={16} className="animate-spin" />
        Loading your videos&hellip;
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-silver-500">
        <FolderOpen size={20} className="text-silver-600" />
        No videos yet — upload one above to get started.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="flex items-center gap-2 text-sm font-medium text-silver-300">
        <FolderOpen size={15} className="text-accent-bright" />
        Your videos
      </h2>
      <ul className="flex flex-col gap-2">
        {videos.map((video, index) => (
          <motion.li
            key={video.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
            onClick={() => onSelect(video.id)}
            className="group flex cursor-pointer items-center gap-3 rounded-lg border border-white/10
                       bg-base-900/40 px-4 py-3 backdrop-blur-xl transition-all duration-150
                       hover:-translate-y-0.5 hover:border-accent-dim/40 hover:shadow-card"
          >
            <PlayCircle
              size={18}
              className="shrink-0 text-silver-500 transition-colors group-hover:text-accent-bright"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-silver-100">{video.title || video.id}</p>
              {video.created_at && (
                <p className="flex items-center gap-1 text-xs text-silver-500">
                  <Clock size={11} />
                  {formatDate(video.created_at)}
                </p>
              )}
            </div>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${
                STATUS_COLORS[video.status] ?? "border-base-600 text-silver-400"
              }`}
            >
              {video.status}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
