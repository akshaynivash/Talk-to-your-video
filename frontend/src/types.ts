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

export interface VideoSummary {
  id: string;
  title: string | null;
  status: VideoStatus;
  created_at: string | null;
}

export type GraphNodeType = "Video" | "Segment" | "Entity" | "Topic";

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "HAS_SEGMENT" | "MENTIONS";
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
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
