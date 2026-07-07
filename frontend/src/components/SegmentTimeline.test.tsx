import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SegmentTimeline } from "./SegmentTimeline";
import type { SegmentDetail } from "../types";

const segment: SegmentDetail = {
  start: 0,
  end: 8,
  text: "Marie Curie discovered radium.",
  visual_description: "A woman in a lab coat.",
  entities: ["Marie Curie"],
  topics: ["radioactivity"],
};

describe("SegmentTimeline", () => {
  it("shows a placeholder when there are no segments", () => {
    render(<SegmentTimeline segments={[]} />);
    expect(screen.getByText("No segments yet.")).toBeInTheDocument();
  });

  it("renders segment text, visual description, entities, and topics", () => {
    render(<SegmentTimeline segments={[segment]} />);
    expect(screen.getByText("Marie Curie discovered radium.")).toBeInTheDocument();
    expect(screen.getByText("A woman in a lab coat.")).toBeInTheDocument();
    expect(screen.getByText("Marie Curie")).toBeInTheDocument();
    expect(screen.getByText("radioactivity")).toBeInTheDocument();
  });

  it("calls onSeek with the segment start when clicked", () => {
    const onSeek = vi.fn();
    render(<SegmentTimeline segments={[segment]} onSeek={onSeek} />);
    screen.getByText("Marie Curie discovered radium.").closest("li")?.click();
    expect(onSeek).toHaveBeenCalledWith(0);
  });
});
