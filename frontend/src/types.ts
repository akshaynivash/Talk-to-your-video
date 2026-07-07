export type VideoStatus =
  | "queued"
  | "transcribing"
  | "extracting"
  | "embedding"
  | "writing_graph"
  | "complete"
  | "failed";

export const VIDEO_STATUS_ORDER: VideoStatus[] = [
  "queued",
  "transcribing",
  "extracting",
  "embedding",
  "writing_graph",
  "complete",
];

export interface UploadResponse {
  video_id: string;
  job_id: string;
  status: VideoStatus;
}

export interface StatusResponse {
  video_id: string;
  status: VideoStatus;
}

export interface SegmentDetail {
  start: number;
  end: number;
  text: string;
  visual_description: string | null;
  entities: string[];
  topics: string[];
}

export interface Citation {
  start: number;
  end: number;
  text: string;
}

export interface QueryResponse {
  answer: string;
  citations: Citation[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}
