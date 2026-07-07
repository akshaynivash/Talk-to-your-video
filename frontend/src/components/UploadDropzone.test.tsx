import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UploadDropzone } from "./UploadDropzone";

describe("UploadDropzone", () => {
  it("calls onUpload with the selected file and title", () => {
    const onUpload = vi.fn();
    const { container } = render(<UploadDropzone onUpload={onUpload} />);

    const titleInput = screen.getByPlaceholderText("Video title (optional)");
    fireEvent.change(titleInput, { target: { value: "My Video" } });

    const file = new File(["fake bytes"], "clip.mp4", { type: "video/mp4" });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onUpload).toHaveBeenCalledWith(file, "My Video");
  });

  it("does not call onUpload when disabled", () => {
    const onUpload = vi.fn();
    const { container } = render(<UploadDropzone onUpload={onUpload} disabled />);

    const file = new File(["fake bytes"], "clip.mp4", { type: "video/mp4" });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onUpload).not.toHaveBeenCalled();
  });
});
