import { motion } from "framer-motion";
import { Eye, MessageSquare } from "lucide-react";
import type { SegmentDetail } from "../types";

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface SegmentTimelineProps {
  segments: SegmentDetail[];
  onSeek?: (start: number) => void;
}

export function SegmentTimeline({ segments, onSeek }: SegmentTimelineProps) {
  if (segments.length === 0) {
    return <p className="text-sm text-silver-500">No segments yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {segments.map((segment, index) => (
        <motion.li
          key={segment.start}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
          onClick={() => onSeek?.(segment.start)}
          className="group flex cursor-pointer flex-col gap-2 rounded-lg border border-transparent
                     px-3 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-base-600
                     hover:bg-base-800/80 hover:shadow-card"
        >
          <span className="w-fit rounded-md bg-base-800 px-2 py-0.5 font-mono text-xs text-accent-bright
                            transition-colors duration-150 group-hover:bg-accent-dim/15">
            {formatTimestamp(segment.start)}&ndash;{formatTimestamp(segment.end)}
          </span>
          {segment.text && (
            <p className="flex items-start gap-1.5 text-sm text-silver-100">
              <MessageSquare size={14} className="mt-0.5 shrink-0 text-silver-500" />
              {segment.text}
            </p>
          )}
          {segment.visual_description && (
            <p className="flex items-start gap-1.5 text-sm italic text-silver-400">
              <Eye size={14} className="mt-0.5 shrink-0 text-silver-500" />
              {segment.visual_description}
            </p>
          )}
          {(segment.entities.length > 0 || segment.topics.length > 0) && (
            <div className="flex flex-wrap gap-1.5 pl-[21px]">
              {segment.entities.map((entity) => (
                <span
                  key={`e-${entity}`}
                  className="rounded-full bg-base-700 px-2 py-0.5 text-xs text-silver-200"
                >
                  {entity}
                </span>
              ))}
              {segment.topics.map((topic) => (
                <span
                  key={`t-${topic}`}
                  className="rounded-full border border-accent-dim/50 px-2 py-0.5 text-xs text-accent-bright"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </motion.li>
      ))}
    </ul>
  );
}
