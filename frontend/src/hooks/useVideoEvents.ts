import { useEffect, useState } from "react";
import { subscribeEvents } from "../api/client";
import type { VideoStatus } from "../types";

export function useVideoEvents(videoId: string | null): VideoStatus | null {
  const [status, setStatus] = useState<VideoStatus | null>(null);

  useEffect(() => {
    if (!videoId) {
      setStatus(null);
      return;
    }

    const unsubscribe = subscribeEvents(videoId, setStatus);
    return unsubscribe;
  }, [videoId]);

  return status;
}
