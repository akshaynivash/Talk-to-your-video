import { afterEach, describe, expect, it, vi } from "vitest";
import { getSegments, getStatus, postQuery, subscribeEvents, uploadVideo } from "./client";

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status,
      statusText: ok ? "OK" : "Error",
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("uploadVideo", () => {
  it("posts multipart form data and returns the parsed response", async () => {
    mockFetchOnce({ video_id: "v1", job_id: "t1", status: "queued" });

    const file = new File(["bytes"], "clip.mp4", { type: "video/mp4" });
    const result = await uploadVideo(file, "My Video");

    expect(result).toEqual({ video_id: "v1", job_id: "t1", status: "queued" });
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/videos");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
  });
});

describe("getStatus", () => {
  it("fetches the status endpoint for the given video", async () => {
    mockFetchOnce({ video_id: "v1", status: "complete" });
    const result = await getStatus("v1");
    expect(result.status).toBe("complete");
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe("/api/videos/v1/status");
  });
});

describe("getSegments", () => {
  it("fetches and returns the segment list", async () => {
    mockFetchOnce([{ start: 0, end: 8, text: "hi", visual_description: null, entities: [], topics: [] }]);
    const result = await getSegments("v1");
    expect(result).toHaveLength(1);
  });
});

describe("postQuery", () => {
  it("posts the question and returns the answer", async () => {
    mockFetchOnce({ answer: "It's about radium.", citations: [] });
    const result = await postQuery("v1", "What is this about?");
    expect(result.answer).toBe("It's about radium.");

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ video_id: "v1", question: "What is this about?" });
  });
});

describe("uploadVideo error handling", () => {
  it("throws with the response body when the request fails", async () => {
    mockFetchOnce({ detail: "bad file" }, false, 400);
    const file = new File(["bytes"], "clip.mp4", { type: "video/mp4" });
    await expect(uploadVideo(file)).rejects.toThrow("400");
  });
});

describe("subscribeEvents", () => {
  it("forwards parsed status updates and can be unsubscribed", () => {
    const instances: Array<{ onmessage: ((event: MessageEvent) => void) | null; close: () => void; url: string }> = [];

    class FakeEventSource {
      onmessage: ((event: MessageEvent) => void) | null = null;
      close = vi.fn();
      constructor(public url: string) {
        instances.push(this);
      }
    }
    vi.stubGlobal("EventSource", FakeEventSource);

    const onStatus = vi.fn();
    const unsubscribe = subscribeEvents("v1", onStatus);

    expect(instances[0].url).toBe("/api/videos/v1/events");

    instances[0].onmessage?.({ data: JSON.stringify({ status: "transcribing" }) } as MessageEvent);
    expect(onStatus).toHaveBeenCalledWith("transcribing");

    unsubscribe();
    expect(instances[0].close).toHaveBeenCalled();
  });
});
