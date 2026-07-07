import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatPanel } from "./ChatPanel";
import type { ChatMessage } from "../types";

describe("ChatPanel", () => {
  it("shows a placeholder when there are no messages", () => {
    render(<ChatPanel messages={[]} onSend={vi.fn()} />);
    expect(
      screen.getByText("Ask a question about this video once processing completes."),
    ).toBeInTheDocument();
  });

  it("calls onSend with the typed question and clears the input", () => {
    const onSend = vi.fn();
    render(<ChatPanel messages={[]} onSend={onSend} />);

    const input = screen.getByPlaceholderText("Ask about this video...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "What is this about?" } });
    fireEvent.click(screen.getByText("Ask"));

    expect(onSend).toHaveBeenCalledWith("What is this about?");
    expect(input.value).toBe("");
  });

  it("renders assistant messages with citations", () => {
    const messages: ChatMessage[] = [
      { role: "user", content: "What is this about?" },
      {
        role: "assistant",
        content: "It's about radium.",
        citations: [{ start: 12, end: 20, text: "..." }],
      },
    ];
    render(<ChatPanel messages={messages} onSend={vi.fn()} />);

    expect(screen.getByText("It's about radium.")).toBeInTheDocument();
    expect(screen.getByText("0:12")).toBeInTheDocument();
  });

  it("does not call onSend when the question is blank", () => {
    const onSend = vi.fn();
    render(<ChatPanel messages={[]} onSend={onSend} />);
    fireEvent.click(screen.getByText("Ask"));
    expect(onSend).not.toHaveBeenCalled();
  });
});
