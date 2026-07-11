import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as client from "../api/client";
import { VideoLibrary } from "./VideoLibrary";
import type { VideoSummary } from "../types";

describe("VideoLibrary", () => {
  it("shows an empty state when there are no videos", async () => {
    vi.spyOn(client, "listVideos").mockResolvedValue([]);

    render(<VideoLibrary onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(
        screen.getByText("No videos yet — upload one above to get started."),
      ).toBeInTheDocument();
    });
  });

  it("renders videos and calls onSelect when clicked", async () => {
    const video: VideoSummary = {
      id: "video-1",
      title: "My Video",
      status: "complete",
      created_at: "2026-07-07T12:00:00+00:00",
    };
    vi.spyOn(client, "listVideos").mockResolvedValue([video]);
    const onSelect = vi.fn();

    render(<VideoLibrary onSelect={onSelect} />);

    await waitFor(() => {
      expect(screen.getByText("My Video")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("My Video"));
    expect(onSelect).toHaveBeenCalledWith("video-1");
  });
});
