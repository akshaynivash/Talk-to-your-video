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
    <ul className="flex flex-col divide-y divide-base-700">
      {segments.map((segment) => (
        <li
          key={segment.start}
          onClick={() => onSeek?.(segment.start)}
          className="group flex cursor-pointer flex-col gap-2 border-l-2 border-transparent
                     px-3 py-3 transition-colors duration-150 hover:border-accent hover:bg-base-800"
        >
          <div className="flex items-center gap-2 text-xs text-silver-500">
            <span className="font-mono text-accent-bright">
              {formatTimestamp(segment.start)}&ndash;{formatTimestamp(segment.end)}
            </span>
          </div>
          {segment.text && <p className="text-sm text-silver-100">{segment.text}</p>}
          {segment.visual_description && (
            <p className="text-sm italic text-silver-400">{segment.visual_description}</p>
          )}
          {(segment.entities.length > 0 || segment.topics.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
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
                  className="rounded-full border border-accent-dim px-2 py-0.5 text-xs text-accent-bright"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
