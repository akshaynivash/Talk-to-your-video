import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Tag, UploadCloud } from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col gap-3"
    >
      <div className="relative">
        <Tag
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-silver-500"
        />
        <input
          type="text"
          placeholder="Video title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={disabled}
          className="w-full rounded-lg border border-silver-600 bg-base-800/80 py-2.5 pl-9 pr-3
                     text-sm text-silver-100 placeholder-silver-500 outline-none transition-all
                     duration-150 focus:border-accent focus:shadow-glow disabled:opacity-50"
        />
      </div>

      <motion.div
        animate={{ scale: isDragging ? 1.01 : 1 }}
        transition={{ duration: 0.15 }}
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
        className={`group flex cursor-pointer flex-col items-center justify-center gap-3
                    rounded-xl border-2 border-dashed px-6 py-16 text-center backdrop-blur-xl
                    transition-all duration-200 ${
                      isDragging
                        ? "border-accent bg-accent-dim/10 shadow-glow-lg"
                        : "border-base-600 bg-base-900/30 hover:border-silver-500 hover:bg-base-800/40"
                    } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <AnimatePresence mode="wait">
          {disabled ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 size={28} className="animate-spin text-accent-bright" />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full border
                           border-base-600 bg-base-800 text-silver-300 transition-colors
                           duration-200 group-hover:border-accent-dim/50 group-hover:text-accent-bright"
              >
                <UploadCloud size={22} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm text-silver-200">
                  <span className="text-accent-bright">Click to upload</span> or drag a video here
                </p>
                <p className="mt-1 text-xs text-silver-500">MP4, MOV, or WebM</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </motion.div>
    </motion.div>
  );
}
