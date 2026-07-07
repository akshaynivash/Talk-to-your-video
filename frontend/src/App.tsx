import { useEffect, useState } from "react";
import { getSegments, postQuery, uploadVideo } from "./api/client";
import { AppShell } from "./components/AppShell";
import { ChatPanel } from "./components/ChatPanel";
import { ProgressStages } from "./components/ProgressStages";
import { SegmentTimeline } from "./components/SegmentTimeline";
import { UploadDropzone } from "./components/UploadDropzone";
import { useVideoEvents } from "./hooks/useVideoEvents";
import type { ChatMessage, SegmentDetail } from "./types";

export default function App() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [segments, setSegments] = useState<SegmentDetail[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  const status = useVideoEvents(videoId);

  useEffect(() => {
    if (status === "complete" && videoId) {
      getSegments(videoId).then(setSegments).catch(console.error);
    }
  }, [status, videoId]);

  async function handleUpload(file: File, title: string) {
    setUploading(true);
    setUploadError(null);
    try {
      const result = await uploadVideo(file, title);
      setVideoId(result.video_id);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleAsk(question: string) {
    if (!videoId) return;
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsAsking(true);
    try {
      const response = await postQuery(videoId, question);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer, citations: response.citations },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong.",
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  }

  const isReady = status === "complete";

  return (
    <AppShell>
      {!videoId && (
        <div className="mx-auto max-w-xl">
          <UploadDropzone onUpload={handleUpload} disabled={uploading} />
          {uploadError && <p className="mt-3 text-sm text-red-400">{uploadError}</p>}
        </div>
      )}

      {videoId && (
        <div className="flex flex-col gap-6">
          <ProgressStages status={status} />

          {isReady && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="rounded-lg border border-base-700 bg-base-900 p-4">
                <h2 className="mb-3 text-sm font-medium text-silver-300">Segments</h2>
                <SegmentTimeline segments={segments} />
              </section>
              <section className="flex h-[32rem] flex-col rounded-lg border border-base-700 bg-base-900 p-4">
                <h2 className="mb-3 text-sm font-medium text-silver-300">Chat</h2>
                <ChatPanel messages={messages} onSend={handleAsk} isAsking={isAsking} />
              </section>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
