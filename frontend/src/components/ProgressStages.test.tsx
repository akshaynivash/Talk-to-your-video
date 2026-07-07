import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressStages } from "./ProgressStages";

describe("ProgressStages", () => {
  it("renders nothing when status is null", () => {
    const { container } = render(<ProgressStages status={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a failure message when status is failed", () => {
    render(<ProgressStages status="failed" />);
    expect(screen.getByText("Processing failed.")).toBeInTheDocument();
  });

  it("renders all stages when status is queued", () => {
    render(<ProgressStages status="queued" />);
    expect(screen.getByText("Queued")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });
});
