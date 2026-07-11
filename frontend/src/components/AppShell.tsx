import { Clapperboard } from "lucide-react";
import type { ReactNode } from "react";
import { FloatingOrbs } from "./FloatingOrbs";
import { FloatingShapes } from "./FloatingShapes";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-base-950 text-silver-100">
      <div
        aria-hidden
        className="fixed inset-0 bg-grid-fade bg-grid opacity-60"
      />
      <FloatingOrbs />
      <FloatingShapes />

      <header className="sticky top-0 z-10 border-b border-white/5 bg-base-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent-dim/40 bg-accent-dim/10 text-accent-bright shadow-glow backdrop-blur-sm">
            <Clapperboard size={18} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-silver-50">
              Talk to Your Video
            </h1>
            <p className="text-xs text-silver-500">
              Ask questions about what's said{" "}
              <span className="text-accent-bright/80">and</span> what's shown
            </p>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-6 py-12">{children}</main>
    </div>
  );
}
