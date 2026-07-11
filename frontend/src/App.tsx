import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ListVideo, MessagesSquare, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getSegments, postQuery, uploadVideo } from "./api/client";
import { AppShell } from "./components/AppShell";
import { ChatPanel } from "./components/ChatPanel";
import { KnowledgeGraph } from "./components/KnowledgeGraph";
import { ProgressStages } from "./components/ProgressStages";
import { SegmentTimeline } from "./components/SegmentTimeline";
import { UploadDropzone } from "./components/UploadDropzone";
import { VideoLibrary } from "./components/VideoLibrary";
import { useVideoEvents } from "./hooks/useVideoEvents";
import type { ChatMessage, SegmentDetail } from "./types";

type LeftTab = "segments" | "graph";

export default function App() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [segments, setSegments] = useState<SegmentDetail[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [libraryKey, setLibraryKey] = useState(0);
  const [leftTab, setLeftTab] = useState<LeftTab>("segments");

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

  function handleOpenSaved(id: string) {
    setMessages([]);
    setLeftTab("segments");
    setVideoId(id);
  }

  function handleBackToLibrary() {
    setVideoId(null);
    setMessages([]);
    setLibraryKey((k) => k + 1);
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
      <AnimatePresence mode="wait">
        {!videoId && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto flex max-w-xl flex-col gap-10"
          >
            <div>
              <UploadDropzone onUpload={handleUpload} disabled={uploading} />
              {uploadError && <p className="mt-3 text-sm text-red-400">{uploadError}</p>}
            </div>
            <VideoLibrary onSelect={handleOpenSaved} refreshKey={libraryKey} />
          </motion.div>
        )}

        {videoId && (
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBackToLibrary}
                className="flex items-center gap-1.5 text-sm text-silver-400 transition-colors
                           duration-150 hover:text-accent-bright"
              >
                <ArrowLeft size={15} />
                Your videos
              </button>
              <ProgressStages status={status} />
            </div>

            {isReady && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="grid grid-cols-1 gap-6 lg:grid-cols-2"
              >
                <section className="flex h-[32rem] flex-col rounded-xl border border-white/10 bg-base-900/40 p-4 shadow-card backdrop-blur-xl">
                  <div className="mb-3 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setLeftTab("segments")}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors duration-150 ${
                        leftTab === "segments" ? "text-accent-bright" : "text-silver-500 hover:text-silver-300"
                      }`}
                    >
                      <ListVideo size={15} />
                      Segments
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeftTab("graph")}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors duration-150 ${
                        leftTab === "graph" ? "text-accent-bright" : "text-silver-500 hover:text-silver-300"
                      }`}
                    >
                      <Share2 size={15} />
                      Graph
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {leftTab === "segments" ? (
                      <SegmentTimeline segments={segments} />
                    ) : (
                      <KnowledgeGraph videoId={videoId} />
                    )}
                  </div>
                </section>
                <section className="flex h-[32rem] flex-col rounded-xl border border-white/10 bg-base-900/40 p-4 shadow-card backdrop-blur-xl">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-silver-300">
                    <MessagesSquare size={15} className="text-accent-bright" />
                    Chat
                  </h2>
                  <ChatPanel messages={messages} onSend={handleAsk} isAsking={isAsking} />
                </section>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
