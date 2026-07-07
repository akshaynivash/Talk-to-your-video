import type {
  QueryResponse,
  SegmentDetail,
  StatusResponse,
  UploadResponse,
  VideoStatus,
} from "../types";

const API_BASE = "/api";

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${body}`);
  }
  return response.json() as Promise<T>;
}

export async function uploadVideo(file: File, title?: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (title) {
    formData.append("title", title);
  }

  const response = await fetch(`${API_BASE}/videos`, {
    method: "POST",
    body: formData,
  });
  return parseJsonOrThrow<UploadResponse>(response);
}

export async function getStatus(videoId: string): Promise<StatusResponse> {
  const response = await fetch(`${API_BASE}/videos/${videoId}/status`);
  return parseJsonOrThrow<StatusResponse>(response);
}

export async function getSegments(videoId: string): Promise<SegmentDetail[]> {
  const response = await fetch(`${API_BASE}/videos/${videoId}/segments`);
  return parseJsonOrThrow<SegmentDetail[]>(response);
}

export async function postQuery(videoId: string, question: string): Promise<QueryResponse> {
  const response = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_id: videoId, question }),
  });
  return parseJsonOrThrow<QueryResponse>(response);
}

export function subscribeEvents(
  videoId: string,
  onStatus: (status: VideoStatus) => void,
): () => void {
  const source = new EventSource(`${API_BASE}/videos/${videoId}/events`);

  source.onmessage = (event) => {
    const data = JSON.parse(event.data) as { status: VideoStatus };
    onStatus(data.status);
  };

  return () => source.close();
}
