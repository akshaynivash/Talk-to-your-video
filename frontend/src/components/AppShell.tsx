import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-base-950 text-silver-100">
      <header className="border-b border-base-700 bg-base-900 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight text-silver-50">
          Talk to Your Video
        </h1>
        <p className="text-xs text-silver-500">
          Ask questions about what's said <span className="text-silver-400">and</span> what's
          shown.
        </p>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
