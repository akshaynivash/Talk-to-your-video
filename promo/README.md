# Promo video

Programmatic promotional video for **Talk to Your Video**, built with [Remotion](https://www.remotion.dev) (React rendered frame-by-frame to `.mp4` via headless Chromium + ffmpeg). No editing software, no assets — every frame is a React component driven by `interpolate`/`spring`.

Six scenes at 1280×720 / 30fps / 26s, matching the app's black/silver/glass visual language (`src/theme.ts`):

| Scene | File | What it shows |
|---|---|---|
| Title | `src/scenes/TitleScene.tsx` | Logo mark + wordmark + tagline |
| Problem | `src/scenes/ProblemScene.tsx` | The transcript-only-vs-visual differentiator |
| Pipeline | `src/scenes/PipelineScene.tsx` | Upload → Transcribe → Analyze Frames → Build Graph, dissolving into an animated knowledge-graph diagram |
| Chat demo | `src/scenes/ChatDemoScene.tsx` | Mocked Q&A exchange with a timestamp citation chip |
| Tech stack | `src/scenes/TechStackScene.tsx` | Staggered badge reveal of the stack |
| Outro | `src/scenes/OutroScene.tsx` | Closing wordmark |

Scene timing/order is composed in [`src/Composition.tsx`](src/Composition.tsx); the animated grid/orb background shared by every scene lives in [`src/components/Background.tsx`](src/components/Background.tsx).

## Commands

```console
npm install
npm run dev              # Remotion Studio — live preview/scrub each scene
npx remotion render Promo out/promo.mp4
```

The rendered output isn't committed here (`out/` is gitignored) — the current export lives at [`../docs/media/promo.mp4`](../docs/media/promo.mp4).

> Tailwind was removed from this project (`@tailwindcss/oxide`'s native binding has no Node 18 build on this machine) — all styling here is plain inline React `style` objects, not Tailwind classes.
