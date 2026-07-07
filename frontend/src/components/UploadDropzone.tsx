import { useRef, useState } from "react";

interface UploadDropzoneProps {
  onUpload: (file: File, title: string) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onUpload, disabled }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file || disabled) return;
    onUpload(file, title);
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Video title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={disabled}
        className="rounded-md border border-silver-600 bg-base-800 px-3 py-2 text-sm
                   text-silver-100 placeholder-silver-500 outline-none transition-colors
                   duration-150 focus:border-accent disabled:opacity-50"
      />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg
                    border-2 border-dashed px-6 py-12 text-center transition-colors duration-150
                    ${
                      isDragging
                        ? "border-accent bg-base-800 shadow-glow"
                        : "border-silver-600 bg-base-900 hover:border-silver-400"
                    }
                    ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <span className="text-sm text-silver-300">
          Drag a video here, or click to browse
        </span>
        <span className="text-xs text-silver-500">MP4, MOV, or WebM</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
